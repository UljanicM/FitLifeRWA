const request = require('supertest');
const { app, hashPassword, comparePassword, setPool } = require('../indeks'); // Corrected import path

// Mock mysql2/promise
jest.mock('mysql2/promise', () => ({
    createPool: jest.fn(() => ({
        query: jest.fn()
    }))
}));

// Mock bcrypt
jest.mock('bcrypt', () => ({
    hash: jest.fn(),
    compare: jest.fn()
}));

// Mock Google Generative AI
jest.mock('@google/generative-ai', () => ({
    GoogleGenerativeAI: jest.fn()
}));

const generateToken = (user) => {
    return jwt.sign(user, JWT_SECRET, { expiresIn: '1h' });
};

describe('API Endpoints', () => {
    let mockPool;

    beforeEach(() => {
        // Reset all mocks
        jest.clearAllMocks();
        
        // Create mock pool
        mockPool = {
            query: jest.fn()
        };
        
        // Set mock pool
        setPool(mockPool);
    });

    describe('GET /api/planovi', () => {
        it('should return all plans successfully', async () => {
            const mockPlans = [
                { id: 1, naziv_plana: 'Basic Plan', cijena_plana: 100 },
                { id: 2, naziv_plana: 'Premium Plan', cijena_plana: 200 }
            ];

            mockPool.query.mockResolvedValue([mockPlans]);

            const response = await request(app)
                .get('/api/planovi')
                .expect(200);

            expect(response.body).toEqual(mockPlans);
            expect(mockPool.query).toHaveBeenCalledWith('SELECT * FROM Plan');
        });

        it('should handle database error', async () => {
            mockPool.query.mockRejectedValue(new Error('Database error'));

            const response = await request(app)
                .get('/api/planovi')
                .expect(500);

            expect(response.text).toBe('Greška pri dohvaćanju planova.');
        });
    });

    describe('POST /api/planovi', () => {
        it('should create a new plan successfully', async () => {
            const newPlan = {
                naziv_plana: 'Test Plan',
                cijena_plana: 150,
                trajanje_plana: 30,
                prehrana: 'Standard',
                kategorija_plana: 'Fitness'
            };

            mockPool.query.mockResolvedValue([{ insertId: 1 }]);

            const response = await request(app)
                .post('/api/planovi')
                .send(newPlan)
                .expect(201);

            expect(response.body).toEqual({
                message: 'Plan uspješno dodan!',
                id: 1
            });

            expect(mockPool.query).toHaveBeenCalledWith(
                expect.stringContaining('INSERT INTO Plan'),
                [newPlan.naziv_plana, newPlan.cijena_plana, newPlan.trajanje_plana, newPlan.prehrana, newPlan.kategorija_plana]
            );
        });

        it('should return 400 for missing required fields', async () => {
            const incompletePlan = {
                naziv_plana: 'Test Plan'
                // Missing other required fields
            };

            const response = await request(app)
                .post('/api/planovi')
                .send(incompletePlan)
                .expect(400);

            expect(response.body).toEqual({
                message: 'Svi podaci za plan su obavezni.'
            });
        });

        it('should handle duplicate entry error', async () => {
            const newPlan = {
                naziv_plana: 'Test Plan',
                cijena_plana: 150,
                trajanje_plana: 30,
                prehrana: 'Standard',
                kategorija_plana: 'Fitness'
            };

            const duplicateError = new Error('Duplicate entry');
            duplicateError.code = 'ER_DUP_ENTRY';
            mockPool.query.mockRejectedValue(duplicateError);

            const response = await request(app)
                .post('/api/planovi')
                .send(newPlan)
                .expect(409);

            expect(response.body).toEqual({
                message: 'Plan s tim nazivom već postoji.'
            });
        });
    });

    describe('GET /api/treneri', () => {
        it('should return all trainers successfully', async () => {
            const mockTrainers = [
                { ime: 'John', prezime: 'Doe', strucnost: 'Fitness', telefon: '123456789', email: 'john@example.com', oib_trenera: '12345678901' }
            ];

            mockPool.query.mockResolvedValue([mockTrainers]);

            const response = await request(app)
                .get('/api/treneri')
                .expect(200);

            expect(response.body).toEqual(mockTrainers);
        });
    });

    describe('GET /api/treneri/:oib_trenera', () => {
        it('should return specific trainer', async () => {
            const mockTrainer = { 
                ime_trenera: 'John', 
                prezime_trenera: 'Doe', 
                oib_trenera: '12345678901' 
            };

            mockPool.query.mockResolvedValue([[mockTrainer]]);

            const response = await request(app)
                .get('/api/treneri/12345678901')
                .expect(200);

            expect(response.body).toEqual(mockTrainer);
        });

        it('should return 404 for non-existent trainer', async () => {
            mockPool.query.mockResolvedValue([[]]);

            const response = await request(app)
                .get('/api/treneri/99999999999')
                .expect(404);

            expect(response.text).toBe('Trener nije pronađen.');
        });
    });

    describe('POST /api/registracija', () => {
        beforeEach(() => {
            // Mock bcrypt functions
            require('bcrypt').hash.mockResolvedValue('hashedPassword123');
        });

        it('should register a new member successfully', async () => {
            const newMember = {
                oib: '12345678901',
                email: 'test@example.com',
                name: 'Test',
                prezime: 'User',
                password: 'password123'
            };

            mockPool.query.mockResolvedValue([{ insertId: 1 }]);

            const response = await request(app)
                .post('/api/registracija')
                .send(newMember)
                .expect(200);

            expect(response.text).toBe('Član uspješno registriran.');
            expect(require('bcrypt').hash).toHaveBeenCalledWith('password123', 10);
        });

        it('should return 400 for missing required fields', async () => {
            const incompleteMember = {
                email: 'test@example.com'
                // Missing other required fields
            };

            const response = await request(app)
                .post('/api/registracija')
                .send(incompleteMember)
                .expect(400);

            expect(response.text).toBe('OIB, email, ime, prezime i lozinka su obavezni.');
        });

        it('should handle duplicate OIB error', async () => {
            const newMember = {
                oib: '12345678901',
                email: 'test@example.com',
                name: 'Test',
                prezime: 'User',
                password: 'password123'
            };

            const duplicateError = new Error('Duplicate entry');
            duplicateError.code = 'ER_DUP_ENTRY';
            mockPool.query.mockRejectedValue(duplicateError);

            const response = await request(app)
                .post('/api/registracija')
                .send(newMember)
                .expect(409);

            expect(response.text).toBe('Član s tim OIB-om već postoji.');
        });
    });

    describe('POST /api/login', () => {
        beforeEach(() => {
            require('bcrypt').compare.mockResolvedValue(true);
        });

        it('should login member successfully', async () => {
            const mockMember = {
                oib_clana: '12345678901',
                email_clana: 'test@example.com',
                ime_clana: 'Test',
                prezime_clana: 'User',
                lozinka_clana: 'hashedPassword123'
            };

            mockPool.query.mockResolvedValue([[mockMember]]);

            const response = await request(app)
                .post('/api/login')
                .send({
                    email: 'test@example.com',
                    password: 'password123'
                })
                .expect(200);

            expect(response.body.message).toBe('Prijava uspješna');
            expect(response.body.clan).toBeDefined();
            expect(response.body.clan.lozinka_clana).toBeUndefined(); // Password should be removed
        });

        it('should return 400 for missing credentials', async () => {
            const response = await request(app)
                .post('/api/login')
                .send({
                    email: 'test@example.com'
                    // Missing password
                })
                .expect(400);

            expect(response.text).toBe('Email i lozinka su obavezni.');
        });

        it('should return 401 for non-existent user', async () => {
            mockPool.query.mockResolvedValue([[]]);

            const response = await request(app)
                .post('/api/login')
                .send({
                    email: 'nonexistent@example.com',
                    password: 'password123'
                })
                .expect(401);

            expect(response.text).toBe('Pogrešan email ili lozinka.');
        });

        it('should return 401 for wrong password', async () => {
            const mockMember = {
                oib_clana: '12345678901',
                email_clana: 'test@example.com',
                lozinka_clana: 'hashedPassword123'
            };

            mockPool.query.mockResolvedValue([[mockMember]]);
            require('bcrypt').compare.mockResolvedValue(false);

            const response = await request(app)
                .post('/api/login')
                .send({
                    email: 'test@example.com',
                    password: 'wrongpassword'
                })
                .expect(401);

            expect(response.text).toBe('Pogrešan email ili lozinka.');
        });

        it('should set admin role for specific users', async () => {
            const mockAdmin = {
                oib_clana: 'muljanic',
                email_clana: 'safarekerik@gmail.com',
                ime_clana: 'Admin',
                prezime_clana: 'User',
                lozinka_clana: 'hashedPassword123'
            };

            mockPool.query.mockResolvedValue([[mockAdmin]]);

            const response = await request(app)
                .post('/api/login')
                .send({
                    email: 'safarekerik@gmail.com',
                    password: 'password123'
                })
                .expect(200);

            expect(response.body.clan.role).toBe('admin');
        });
    });
});

describe('Helper Functions', () => {
    describe('hashPassword', () => {
        it('should hash password correctly', async () => {
            require('bcrypt').hash.mockResolvedValue('hashedPassword123');
            
            const result = await hashPassword('password123');
            
            expect(result).toBe('hashedPassword123');
            expect(require('bcrypt').hash).toHaveBeenCalledWith('password123', 10);
        });
    });

    describe('comparePassword', () => {
        it('should compare passwords correctly', async () => {
            require('bcrypt').compare.mockResolvedValue(true);
            
            const result = await comparePassword('password123', 'hashedPassword123');
            
            expect(result).toBe(true);
            expect(require('bcrypt').compare).toHaveBeenCalledWith('password123', 'hashedPassword123');
        });
    });
});