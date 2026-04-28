import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Clock, Users, Award } from 'lucide-react';

const TRAINER_DATA = {
  id: 1,
  name: 'Andre Viana',
  title: 'Personal Trainer',
  totalClients: 24,
  classesPerWeek: 8,
  yearsExperience: 6,
  bio: 'Certified personal trainer specializing in functional fitness and mobility work. Passionate about helping clients achieve their goals through personalized training and mindfulness.',
  specialities: ['Pilates', 'Strength', 'Dance', 'Mobility', 'Meditation', 'Vision Support'],
  classes: [
    { id: 1, name: 'Morning Strength', day: 'MON', time: '07:00', type: 'STRENGTH' },
    { id: 2, name: 'Pilates Flow', day: 'TUE', time: '18:00', type: 'PILATES' },
    { id: 3, name: 'Yoga Stretch', day: 'WED', time: '09:00', type: 'YOGA' },
    { id: 4, name: 'Dance Cardio', day: 'THU', time: '19:00', type: 'DANCE' },
    { id: 5, name: 'Core Work', day: 'FRI', time: '17:00', type: 'STRENGTH' },
    { id: 6, name: 'Weekend Mobility', day: 'SAT', time: '10:00', type: 'MOBILITY' },
    { id: 7, name: 'Meditation Session', day: 'SUN', time: '18:00', type: 'MEDITATION' },
    { id: 8, name: 'Evening Strength', day: 'WED', time: '20:00', type: 'STRENGTH' },
  ],
};

export default function TrainerProfile() {
  const navigate = useNavigate();

  return (
    <div className="w-full bg-white min-h-screen pb-24 animate-fade-in">
      {/* Hero Section with Photo */}
      <div className="relative w-full h-64 overflow-hidden">
        {/* Background image */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'url(/images/newcastle-62.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-grey-1005" />
        </div>

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 p-2 hover:bg-grey-300 transition rounded-full z-10"
        >
          <ChevronLeft className="w-6 h-6 text-black" />
        </button>

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-end p-6">
          <h1 className="text-4xl font-black text-black uppercase mb-1">{TRAINER_DATA.name}</h1>
          <p className="text-brazil-green font-bold text-sm uppercase">{TRAINER_DATA.title}</p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="px-5 py-6 grid grid-cols-3 gap-3 border-b border-grey-100">
        {[
          { label: 'Total Clients', value: TRAINER_DATA.totalClients, icon: Users },
          { label: 'Classes/Week', value: TRAINER_DATA.classesPerWeek, icon: Clock },
          { label: 'Experience', value: `${TRAINER_DATA.yearsExperience}y`, icon: Award },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-grey-300 rounded-[12px] p-4 text-center">
              <Icon className="w-5 h-5 text-brazil-green mx-auto mb-2" />
              <p className="text-black text-2xl font-black">{stat.value}</p>
              <p className="text-grey-200 text-xs mt-2">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* About Section */}
      <div className="px-5 py-6 border-b border-grey-100">
        <h3 className="text-black text-xs font-bold uppercase tracking-widest mb-3 text-grey-200">About</h3>
        <p className="text-grey-200 text-sm leading-relaxed">{TRAINER_DATA.bio}</p>
      </div>

      {/* Specialities */}
      <div className="px-5 py-6 border-b border-grey-100">
        <h3 className="text-black text-xs font-bold uppercase tracking-widest mb-4 text-grey-200">Specialities</h3>
        <div className="flex flex-wrap gap-2">
          {TRAINER_DATA.specialities.map((spec, i) => (
            <span key={i} className="badge-pro text-xs px-3 py-1.5">
              {spec}
            </span>
          ))}
        </div>
      </div>

      {/* Classes Section */}
      <div className="px-5 py-6 border-b border-grey-100">
        <h3 className="text-black text-xs font-bold uppercase tracking-widest mb-4 text-grey-200">My Classes</h3>
        <div className="space-y-3">
          {TRAINER_DATA.classes.map((cls) => (
            <div key={cls.id} className="flex items-center justify-between p-4 bg-grey-300 rounded-[12px]">
              <div className="flex-1">
                <p className="text-black font-bold text-sm">{cls.name}</p>
                <p className="text-grey-200 text-xs mt-0.5">{cls.day} · {cls.time}</p>
                <span className="badge-green text-[10px] mt-2 inline-block">{cls.type}</span>
              </div>
              <button className="bg-brazil-green hover:bg-brazil-green-dark text-black font-bold px-4 py-2 rounded-[6px] text-xs transition-all active:scale-95">
                BOOK
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Available Sessions */}
      <div className="px-5 py-6">
        <h3 className="text-black text-xs font-bold uppercase tracking-widest mb-4 text-grey-200">My PT Sessions</h3>
        <div className="bg-grey-300 rounded-[12px] p-6 text-center">
          <p className="text-black text-2xl font-black mb-2">3</p>
          <p className="text-grey-200 text-sm">Available slots for new clients</p>
          <button className="w-full bg-brazil-green hover:bg-brazil-green-dark text-black font-bold py-3 rounded-[8px] mt-4 transition-all active:scale-95">
            BOOK A SESSION
          </button>
        </div>
      </div>
    </div>
  );
}
