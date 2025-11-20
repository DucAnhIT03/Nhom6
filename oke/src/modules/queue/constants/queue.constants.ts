export const QUEUE_NAMES = {
  EMAIL: 'email',
  UPLOAD: 'upload',
} as const;

export const EMAIL_JOBS = {
  SEND_EMAIL: 'send-email',
  SEND_TEMPLATE_EMAIL: 'send-template-email',
  SEND_WELCOME_EMAIL: 'send-welcome-email',
  SEND_PASSWORD_RESET_EMAIL: 'send-password-reset-email',
} as const;

export const UPLOAD_JOBS = {
  UPLOAD_SINGLE: 'upload-single',
  UPLOAD_MULTIPLE: 'upload-multiple',
  REMOVE_IMAGE: 'remove-image',
} as const;












