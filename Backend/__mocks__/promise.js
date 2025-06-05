    // __mocks__/mysql2/promise.js
    const mysql = jest.createMockFromModule('mysql2/promise');

    // Lažna implementacija pool-a
    const mockPool = {
        query: jest.fn().mockResolvedValue([[]]), // Vraća prazan array kao default
        execute: jest.fn().mockResolvedValue([[]]),
        getConnection: jest.fn().mockResolvedValue({
            query: jest.fn().mockResolvedValue([[]]),
            execute: jest.fn().mockResolvedValue([[]]),
            release: jest.fn(),
        }),
        // Dodajte druge metode koje vaša aplikacija koristi
    };

    mysql.createPool = jest.fn(() => {
        console.log("Pozvan mock mysql.createPool");
        return Promise.resolve(mockPool);
    });

    // Izvezite mockPool da biste mogli resetirati mockove ili postaviti specifične povratne vrijednosti u testovima
    mysql.mockPool = mockPool;

    module.exports = mysql;
    