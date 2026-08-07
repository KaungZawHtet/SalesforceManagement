import type ***REMOVED*** Metadata ***REMOVED*** from 'next';
import ***REMOVED*** Geist, Geist_Mono ***REMOVED*** from 'next/font/google';
import './globals.css';

const geistSans = Geist(***REMOVED***
  variable: '--font-geist-sans',
  subsets: ['latin'],
***REMOVED***);

const geistMono = Geist_Mono(***REMOVED***
  variable: '--font-geist-mono',
  subsets: ['latin'],
***REMOVED***);

export const metadata: Metadata = ***REMOVED***
  title: 'Salesforce Account Manager',
  description: 'View and manage Salesforce accounts',
***REMOVED***;

export default function RootLayout(***REMOVED***
  children,
***REMOVED***: Readonly<***REMOVED***
  children: React.ReactNode;
***REMOVED***>) ***REMOVED***
  return (
    <html
      lang="en"
      className=***REMOVED***`$***REMOVED***geistSans.variable***REMOVED*** $***REMOVED***geistMono.variable***REMOVED*** h-full antialiased`***REMOVED***
    >
      <body className="min-h-full flex flex-col">
        ***REMOVED***children***REMOVED***
      </body>
    </html>
  );
***REMOVED***