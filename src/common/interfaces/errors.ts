export interface IErrorData {
  code?: string;
  description?: string;
  message?: string;
  title?: string;
  errorType?: string;
  exceptionDetails?: [
    {
      component: string;
      description: string;
      endpoint: string;
    },
  ];
  additionalData?: IObj;
}
