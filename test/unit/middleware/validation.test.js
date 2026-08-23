jest.mock('express-validator', () => ({
    validationResult: jest.fn(),
}));

const { validationResult } = require('express-validator');
const handleValidationErrors = require('../../../src/middleware/validation');
const { mockReq, mockRes, mockNext } = require('../../helpers/http');

describe('handleValidationErrors', () => {
    beforeEach(() => {
        validationResult.mockReset();
    });

    it('calls next when there are no validation errors', () => {
        validationResult.mockReturnValue({
            isEmpty: () => true,
            array: () => [],
        });
        const next = mockNext();

        handleValidationErrors(mockReq(), mockRes(), next);

        expect(next).toHaveBeenCalledTimes(1);
    });

    it('returns 400 with joined messages when validation fails', () => {
        validationResult.mockReturnValue({
            isEmpty: () => false,
            array: () => [{ msg: 'Phone number is required' }, { msg: 'Text message exceeds maximum length of 4096 characters' }],
        });
        const res = mockRes();
        const next = mockNext();

        handleValidationErrors(mockReq(), res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: 'Phone number is required, Text message exceeds maximum length of 4096 characters',
            errors: [
                { msg: 'Phone number is required' },
                { msg: 'Text message exceeds maximum length of 4096 characters' },
            ],
        });
        expect(next).not.toHaveBeenCalled();
    });
});
