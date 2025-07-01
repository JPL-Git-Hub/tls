"use client"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { signInWithGoogle } from '@/lib/firebase/auth';
import { UserCredential } from 'firebase/auth';

interface AttorneyLoginProps {
  onSuccess?: (user: UserCredential) => void;
  onError?: (error: string) => void;
}

export default function AttorneyLogin({ onSuccess, onError }: AttorneyLoginProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const userCredential = await signInWithGoogle();
      onSuccess?.(userCredential);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Google sign-in failed';
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Attorney Login</CardTitle>
        <CardDescription>
          Sign in with your @thelawshop.com Google account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full"
          variant="outline"
        >
          {isLoading ? 'Signing in...' : 'Continue with Google'}
        </Button>
      </CardContent>
    </Card>
  );
}