const request = require('supertest');
const app = require('./server'); // The path is correct now

// Mock the Supabase client
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      insert: jest.fn(), // We will configure this mock in each test
    })),
  })),
}));

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient();

describe('API Endpoints', () => {
  beforeEach(() => {
    // Reset mocks before each test to ensure they are isolated
    jest.clearAllMocks();
  });

  describe('POST /api/submit', () => {
    it('should return a 400 status and error messages for invalid data', async () => {
      // For this test, the database should NOT be called.
      // We are testing the validation logic which runs before the database insert.
      const invalidData = {
        aadhaarNumber: '123456789012',
        // entrepreneurName is missing, which is required
      };

      const response = await request(app)
        .post('/api/submit')
        .send(invalidData);

      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContain('Name of Entrepreneur is required');
    });

    it('should return a 200 status and success message for valid data', async () => {
      // For this test, we mock a SUCCESSFUL database call.
      const insertMock = supabase.from('registrations').insert;
      insertMock.mockResolvedValue({ error: null }); // Simulate no error from Supabase

      const validData = {
        entrepreneurName: 'John Doe',
        aadhaarNumber: '123456789012',
        aadhaarConsent: true,
        panNumber: 'ABCDE1234F',
        panHolderName: 'John Doe',
        panDOB: '1990-01-01',
        panDOI: '2020-01-01',
        organisationType: 'Sole Proprietorship',
        state: 'Maharashtra',
        district: 'Mumbai',
        address: '123 Main St, Mumbai, Maharashtra',
        flatDoorBlock: 'Flat 101',
        villageTownCity: 'Mumbai',
        pinCode: '400001',
        plantName: 'Plant A',
        panConsent: true,
        addressPincode: '400001',
      };


      const response = await request(app)
        .post('/api/submit')
        .send(validData);

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Form submitted successfully');
      expect(insertMock).toHaveBeenCalledTimes(1); // Verify DB was called
    });

    it('should return a 500 status if the database insertion fails', async () => {
      // For this test, we mock a FAILED database call.
      const insertMock = supabase.from('registrations').insert;
      const dbError = { message: 'Database connection failed', code: '50000' };
      insertMock.mockResolvedValue({ error: dbError });

      const validData = {
        entrepreneurName: 'Jane Doe',
        aadhaarNumber: '987654321098',
        aadhaarConsent: true,
        panNumber: 'FGHIJ5678K',
        // ... and all other required fields
      };

      const response = await request(app)
        .post('/api/submit')
        .send(validData);

      expect(response.statusCode).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Database error');
    });
  });
});
