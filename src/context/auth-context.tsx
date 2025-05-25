const login = async (email: string, password?: string) => {
  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (response.ok) {
      const userData = await response.json();
      setUser(userData);  // Update your user state
      console.log(`Welcome, ${userData.name}, role: ${userData.role}`);
      // Add navigation logic here if needed, e.g., redirect based on role
    } else {
      throw new Error('Login failed');
    }
  } catch (error) {
    console.error('Login error:', error);
    alert('Login failed. Please try again.');
  }
};
