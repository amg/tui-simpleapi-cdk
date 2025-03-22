export interface User {
  firstName: string,
  lastName: string
}

export function validateUser(body: string): User {
  const parsed = JSON.parse(body) as User;
  // ignore anything else explicitly
  return {
    firstName: parsed.firstName,
    lastName: parsed.lastName
  };
}