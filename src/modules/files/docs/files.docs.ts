import { ApiResponseOptions } from "@nestjs/swagger";

const GetFileApiResponse: ApiResponseOptions = {
  status: 200,
  description: "Successful response with the requested file.",
  content: {
    "application/octet-stream": {
      schema: {
        type: "string",
        format: "binary",
      },
    },
  },
};

export { GetFileApiResponse };
