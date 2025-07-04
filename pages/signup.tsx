import React from 'react';
import Head from 'next/head';
import { SignUpCard } from '@/components/ui/sign-up-card';

export default function SignUpPage() {
  return (
    <>
      <Head>
        <title>Sign Up | Research Connect</title>
        <meta name="description" content="Create your Research Connect account" />
      </Head>
      <SignUpCard />
    </>
  );
} 