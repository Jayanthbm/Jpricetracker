export type EmailSend = {
  from?: string,
  to: string,
  subject: string,
  html?: any
}