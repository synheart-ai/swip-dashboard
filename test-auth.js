// Simple test to check if Better Auth is working
import { auth } from "./src/lib/auth";

console.log("Testing Better Auth...");
console.log("Auth object:", typeof auth);
console.log("Auth handler:", typeof auth.handler);
console.log("Auth API:", typeof auth.api);

// Check if social providers are configured
if (auth.options && auth.options.socialProviders) {
  console.log("Social providers:", Object.keys(auth.options.socialProviders));
} else {
  console.log("No social providers found in auth.options");
}

// Test if we can call the handler
try {
  console.log("Handler type:", typeof auth.handler);
} catch (error) {
  console.error("Error accessing handler:", error);
}
