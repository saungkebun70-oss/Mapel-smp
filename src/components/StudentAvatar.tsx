import React, { useState } from 'react';
import { AVATAR_OPTIONS } from '../data/defaultSchedules';
import { AvatarId } from '../types';

interface StudentAvatarProps {
  avatarId: AvatarId;
  fullName: string;
  sizeClass?: string;
}

export const StudentAvatar: React.FC<StudentAvatarProps> = ({
  avatarId,
  fullName,
  sizeClass = 'w-14 h-14',
}) => {
  const [imgError, setImgError] = useState(false);
  const option = AVATAR_OPTIONS.find((a) => a.id === avatarId) || AVATAR_OPTIONS[0];
  const initials = fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() || '')
    .join('') || 'S';

  if (imgError) {
    return (
      <div
        className={`${sizeClass} ${option.bgClass} rounded-2xl flex items-center justify-center font-display font-bold text-slate-800 shrink-0 select-none`}
        aria-label={fullName}
      >
        {initials}
      </div>
    );
  }

  return (
    <img
      src={option.src}
      alt={`Avatar ${fullName}`}
      referrerPolicy="no-referrer"
      onError={() => setImgError(true)}
      className={`${sizeClass} ${option.bgClass} rounded-2xl object-cover shrink-0`}
    />
  );
};
