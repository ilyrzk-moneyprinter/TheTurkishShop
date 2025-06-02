// Basic HelpRequest type definition
export interface HelpRequest {
  id: string;
  userId: string;
  email: string;
  subject: string;
  message: string;
  status: 'new' | 'inProgress' | 'resolved' | 'closed';
  createdAt: any; // Using any type for flexibility
  updatedAt?: any;
} 