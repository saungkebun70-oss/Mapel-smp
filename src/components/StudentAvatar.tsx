import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { AVATAR_OPTIONS } from '../data/defaultSchedules';
import { AvatarId } from '../types';

interface StudentAvatarProps {
  avatarId: AvatarId;
  fullName: string;
  customPhotoUrl?: string | null;
  sizeClass?: string;
}

export const StudentAvatar: React.FC<StudentAvatarProps> = ({
  avatarId,
  fullName,
  customPhotoUrl,
  sizeClass = 'w-14 h-14',
}) => {
  const [imgError, setImgError] = useState(false);
  const option = AVATAR_OPTIONS.find((a) => a.id === avatarId) || AVATAR_OPTIONS[0];
  const activeSrc = customPhotoUrl || option.src;

  useEffect(() => {
    setImgError(false);
  }, [activeSrc]);

  const initials =
    fullName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((n) => n[0]?.toUpperCase() || '')
      .join('') || 'S';

  return (
    <motion.div
      whileHover={{ scale: 1.07, rotate: -3 }}
      whileTap={{ scale: 0.93 }}
      transition={{ type: 'spring', stiffness: 380, damping: 18 }}
      className="shrink-0 inline-flex"
    >
      {imgError ? (
        <div
          className={`${sizeClass} ${option.bgClass} rounded-2xl flex items-center justify-center font-display font-bold text-slate-800 shrink-0 select-none`}
          aria-label={fullName}
        >
          {initials}
        </div>
      ) : (
        <img
          src={activeSrc}
          alt={`Foto profil ${fullName}`}
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          className={`${sizeClass} ${option.bgClass} rounded-2xl object-cover shrink-0`}
        />
      )}
    </motion.div>
  );
};
