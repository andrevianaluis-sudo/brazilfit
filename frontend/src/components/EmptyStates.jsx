export function EmptySessionsState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-96 px-5 text-center">
      <svg className="w-24 h-24 mb-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <h3 className="text-black font-black text-2xl uppercase mb-2">Your Journey Starts Here</h3>
      <p className="text-grey-200 text-sm">Your first session will appear here after your PT schedules it</p>
    </div>
  );
}

export function EmptyWorkoutsState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-96 px-5 text-center">
      <svg className="w-24 h-24 mb-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
      <h3 className="text-black font-black text-2xl uppercase mb-2">No Workouts Yet</h3>
      <p className="text-grey-200 text-sm mb-6">Start your first workout to see your history here</p>
      <button className="px-6 py-3 rounded-[12px] bg-brazil-green text-black font-bold uppercase text-xs tracking-widest hover:bg-brazil-green-dark transition">
        Start Exploring
      </button>
    </div>
  );
}

export function EmptyHabitsState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-96 px-5 text-center">
      <svg className="w-24 h-24 mb-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <h3 className="text-black font-black text-2xl uppercase mb-2">Check In Today</h3>
      <p className="text-grey-200 text-sm mb-6">Log your daily habits to build your streak</p>
      <button className="px-6 py-3 rounded-[12px] bg-brazil-green text-black font-bold uppercase text-xs tracking-widest hover:bg-brazil-green-dark transition">
        Log Habits
      </button>
    </div>
  );
}

export function EmptyMessagesState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-96 px-5 text-center">
      <svg className="w-24 h-24 mb-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
      <h3 className="text-black font-black text-2xl uppercase mb-2">No Messages Yet</h3>
      <p className="text-grey-200 text-sm">Your PT will reach out soon</p>
    </div>
  );
}

export function EmptyAchievementsState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-96 px-5 text-center">
      <svg className="w-24 h-24 mb-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3-1.343-3-3s1.343-3 3-3 3 1.343 3 3-1.343 3-3 3zm0 2c-2.209 0-4 1.791-4 4s1.791 4 4 4 4-1.791 4-4-1.791-4-4-4zm0 6c-1.105 0-2 .895-2 2v4h4v-4c0-1.105-.895-2-2-2z" />
      </svg>
      <h3 className="text-black font-black text-2xl uppercase mb-2">Your First Badge Awaits</h3>
      <p className="text-grey-200 text-sm mb-6">Complete your first session to earn your first achievement</p>
      <button className="px-6 py-3 rounded-[12px] bg-brazil-green text-black font-bold uppercase text-xs tracking-widest hover:bg-brazil-green-dark transition">
        See All Badges
      </button>
    </div>
  );
}

export function EmptyPhotosState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-96 px-5 text-center">
      <svg className="w-24 h-24 mb-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <h3 className="text-black font-black text-2xl uppercase mb-2">Capture Your Progress</h3>
      <p className="text-grey-200 text-sm mb-6">Add your first photo to start tracking your transformation</p>
      <button className="px-6 py-3 rounded-[12px] bg-brazil-green text-black font-bold uppercase text-xs tracking-widest hover:bg-brazil-green-dark transition">
        Add Photo
      </button>
    </div>
  );
}

export function EmptyChallengesState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-96 px-5 text-center">
      <svg className="w-24 h-24 mb-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
      </svg>
      <h3 className="text-black font-black text-2xl uppercase mb-2">No Active Challenges</h3>
      <p className="text-grey-200 text-sm">Your PT will create challenges to keep you motivated</p>
    </div>
  );
}

