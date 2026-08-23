const { sendErrorResponse, sendSuccessResponse } = require('../../../src/utils/errors.util');
const { mockRes } = require('../../helpers/http');

describe('errors.util', () => {
    it('sends a success envelope with optional data', () => {
        const res = mockRes();
        sendSuccessResponse(res, 200, 'Text message sent successfully', { messageId: 'abc' });

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                success: true,
                message: 'Text message sent successfully',
                data: { messageId: 'abc' },
                timestamp: expect.any(String),
            })
        );
    });

    it('omits data when none is provided', () => {
        const res = mockRes();
        sendSuccessResponse(res, 201, 'created');
        const body = res.json.mock.calls[0][0];
        expect(body.data).toBeUndefined();
        expect(body.success).toBe(true);
    });

    it('sends an error envelope with optional errors', () => {
        const res = mockRes();
        sendErrorResponse(res, 400, 'bad request', [{ msg: 'phone required' }]);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                success: false,
                message: 'bad request',
                errors: [{ msg: 'phone required' }],
            })
        );
    });
});
