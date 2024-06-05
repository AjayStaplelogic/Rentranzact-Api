export const validator = (data, schema) => {

    let errorMessages = [];
    const schemaValidation = schema.validate(data, {abortEarly: false});
  
    if (schemaValidation?.error) {
      if (schemaValidation?.error?.details) {
        schemaValidation
          .error
          .details
          .forEach(err => {
            errorMessages.push(err.message);
          });
      }
    }
  
    if (schemaValidation?.error) {
      return {
        isError: true,
        errors: errorMessages.length ? errorMessages : schemaValidation?.error?.message
  
      };
    }
  
    return {
      isError: false,
      errors: errorMessages
    };
  };