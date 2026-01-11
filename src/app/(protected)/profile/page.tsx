import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/utilities/getCurrentUser';
import UserProfileForm from '@/components/UserProfileForm';

export default async function UserProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="p-8 text-black">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">User Profile</h1>
        <UserProfileForm initialData={user} />
      </div>
    </div>
  );
}
