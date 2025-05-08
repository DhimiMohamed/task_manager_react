// src/lib/logout.ts
export function logout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  
    // If using context/auth state, reset it here
  
    // Redirect to login
    window.location.href = "/login";
  }
  