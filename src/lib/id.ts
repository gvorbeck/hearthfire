// Shared client-side ID generator for ephemeral entities (followers, NPCs,
// characters, toasts, steading improvements). crypto.randomUUID is available in
// all browsers this app targets; one helper keeps the call site uniform.
export const generateId = () => crypto.randomUUID();
