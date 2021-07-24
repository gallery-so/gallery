/**
 * GALLERY SERVER RESPONSE FORMAT
 *
 * Example success response:
 *   {
 *     data: {
 *       env: 'dev',
 *       msg: 'gallery operational',
 *     },
 *     status: 'OK',
 *   }
 *
 * Example error response:
 *   {
 *     data: {
 *       handler_error_user_msg:
 *         'handler /glry/v1/auth/get_preflight failed unexpectedly',
 *     },
 *     status: 'ERROR',
 *   }
 */
type SuccessResponse<T = {}> = {
  data: T;
  status: 'OK';
};

type ErrorResponse = {
  data: {
    handler_error_user_msg: string;
  };
  status: 'ERROR';
};

export type ApiResponse<T = {}> = SuccessResponse<T> | ErrorResponse;
