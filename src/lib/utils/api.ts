import { redirect } from 'next/navigation';

export async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    if (response.status === 401) {
      // Redirect to sign-in page with the current URL as callback
      const currentUrl = window.location.pathname;
      window.location.href = `/sign-in?callbackUrl=${encodeURIComponent(currentUrl)}`;
      throw new Error('Unauthorized');
    }
    throw new Error(`API error: ${response.statusText}`);
  }
  return response.json();
} 
