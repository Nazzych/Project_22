import React, { useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { ProgressBar } from '../components/ui/ProgressBar'
import {
    Crown,
    ShieldCheck,
    Calendar,
    MapPin,
    Github,
    Twitter,
    Youtube,
    Linkedin,
    BookOpen,
    Pencil,
    Edit,
    Shield,
    Terminal,
} from 'lucide-react'
import { useProfile } from '../contexts/ProfileContext';
import { formatJoinDate } from '../lib/formatDate';
import { useModal } from '../hooks/useModal';
import { EditProfileForm } from '../components/shared/modal/modals/profile/EditProfileForm'
import { Link, useLocation } from 'react-router-dom';
import { GitHubProfile } from '../types/profile';
import { jwtDecode } from 'jwt-decode';
import { useToast } from '../providers/MessageProvider';
import { ShowBio } from '../components/shared/modal/modals/profile/ShowBio'
import { GitHubProfileModal } from '../components/shared/modal/modals/profile/ShowGitData'

export function Profile() {
    const { showToast } = useToast();
    const hasShown = useRef(false);

    const location = useLocation();
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        if (!token) return;

        try {
            const decoded = jwtDecode<{ profile_data: GitHubProfile }>(token);
            if (decoded.profile_data.created && !hasShown.current) {
                showToast('success', 'Security', 'Account password sent to your email.');
                hasShown.current = true;
            }
            openModal({
                id: 'modal-github-profile',
                width: 'xl',
                title: (
                <div className="w-[57.5%] md:w-[40%] flex flex-row justify-center items-center gap-2 nz-background-secondary px-4 py-1 rounded-lg">
                    <Github className="w-5 h-5" />
                    Заповнення профілю
                </div>
                ),
                content: <GitHubProfileModal githubData={decoded.profile_data} existingBio={profile?.profile?.bio || ''} />,
            });
        } catch (err) {
            console.error('Token decode error:', err);
        }
    }, [location.search]);

    const { profile } = useProfile();
    const { openModal, closeModal } = useModal();
    const handleClick = () => {
        if (!profile) return;
            openModal({
                id: 'edit-profile',
                width: "xl",
                title: (
                    <div className='w-40 flex flex-row justify-center items-center gap-2 nz-background-secondary px-4 py-1 rounded-lg'>
                        <Edit className="w-5 h-5 text-primary" /> Edit Profile
                    </div>
                ),
                content: (
                <EditProfileForm
                    onSuccess={closeModal}
                    initialData={{
                        first_name: profile?.first_name,
                        last_name: profile?.last_name,
                        username: profile?.username.toLowerCase(),
                        email: profile?.email,
                        bio: profile?.profile.bio,
                        address: profile?.profile.address,
                        youtube: profile?.profile.youtube,
                        twitter: profile?.profile.twitter,
                        linkedin: profile?.profile.linkedin,
                        git: profile?.profile.git,
                    }}
                    />
                ),
            });
        };
    const handleOpenBio = () => {
        openModal({
            id: "modal-bio",
            width: "lg",
            x: false,
            title: (
                <div className='w-fit flex flex-row justify-center items-center gap-2'>
                    <BookOpen className="w-5 h-5 text-primary" /> Your Bio
                </div>
            ),
            content: <ShowBio bio={String(profile?.profile.bio)} />,
        });
    };

    return (
        <div className="space-y-8">
            {/* Profile Header */}
            <div className="relative">
                {/* Banner */}
                <div className="h-48 rounded-3xl overflow-hidden relative border border-white/10">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 animate-pulse-neon" />
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                    <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-background to-transparent" />
                    <div>
                        {profile?.profile.bio && (
                            <button
                                onClick={handleOpenBio}
                                type="button"
                                className="group absolute top-3 left-3 flex items-center gap-2 w-10 h-10 pl-[0.5728rem] rounded-full nz-background-primary nz-text-secondary border shadow-md transition-all duration-300 overflow-hidden hover:w-[4.4rem]"
                                aria-label="Edit Bio"
                                >
                                <BookOpen className="h-5 w-5 shrink-0" />
                                <span className="whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                    Bio
                                </span>
                            </button>
                        )}
                        <button  onClick={handleClick}
                            type="button"
                            className="group absolute top-3 right-3 flex flex-row-reverse items-center gap-2 w-10 h-10 pr-[0.5725rem] rounded-full nz-background-primary nz-text-secondary border shadow-md transition-all duration-300 overflow-hidden hover:w-32"
                            aria-label="Edit">
                            <Pencil className="h-5 w-5 shrink-0" />
                            <span className="whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                Edit Profile
                            </span>
                        </button>
                    </div>
                </div>
                {/* Profile Info */}
                <div className="px-6 md:px-10 -mt-20 relative z-10 p-4 nz-background-primary rounded-b-3xl">
                    <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
                        <div className="relative group w-fit">
                            <div className="absolute inset-0 bg-gradient-to-tr from-primary to-secondary rounded-full blur-lg opacity-50 group-hover:opacity-100 transition-opacity" />
                            <div className="relative z-10">
                                <img
                                    src={profile?.profile.avatar_url}
                                    alt="User avatar"
                                    className="h-28 w-28 rounded-full object-cover border border-white/10 shadow-md nz-ring" />
                                <div className="absolute bottom-1 -right-2 nz-background-accent nz-foreground border border-primary text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                                    LVL {profile?.profile.total_points || "0"}
                                </div>
                            </div>
                            {profile?.is_superuser && (
                                <div className="absolute -top-1 -right-1 nz-background-secondary p-1 rounded-2xl border-2 z-50">
                                    <Crown className="w-6 h-6" />
                                </div>
                            )}

                            {profile?.is_staff && !profile?.is_superuser && (
                                <div className="absolute -top-1 -right-1 nz-background-secondary p-1 rounded-2xl border-2 z-50">
                                    <ShieldCheck className="w-6 h-6" />
                                </div>
                            )}
                        </div>
                        <div className="flex-1 space-y-2 mt-2 md:mb-4">
                            <div className="flex flex-col">
                                <h1 className="text-4xl font-bold nz-foreground tracking-tight">
                                    {profile?.first_name} {profile?.last_name}
                                </h1>
                                <p className="p-1 font-medium nz-text-muted">
                                    @{profile?.username.toLocaleLowerCase()}
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                {profile?.profile.address && (
                                    <span className="inline-flex items-center px-3 py-1 nz-foreground nz-background-accent rounded-full border nz-border border-white/10 text-xs gap-1.5">
                                        <MapPin className="h-4 w-4 nz-text-primary" /> {profile.profile.address}
                                    </span>
                                )}
                                {profile?.date_joined && (
                                    <span className="inline-flex items-center px-3 py-1 nz-foreground nz-background-accent rounded-full border nz-border border-white/10 text-xs gap-1.5">
                                        <Calendar className="h-4 w-4 nz-text-secondary" /> Joined {formatJoinDate(profile.date_joined)}
                                    </span>
                                )}
                                <span className="inline-flex items-center px-3 py-1 nz-foreground nz-background-accent rounded-full border nz-border border-white/10 text-xs gap-1.5">
                                    <Terminal className="h-4 w-4 nz-text-accent" /> Full Stack
                                    Developer
                                </span>
                            </div>
                        </div>
                            {/* <label htmlFor="AcceptConditions1" className="relative block h-4 w-8 rounded-full bg-gray-300 transition-colors [-webkit-tap-highlight-color:transparent] has-checked:bg-blue-500 dark:bg-gray-600 dark:has-checked:bg-blue-600">
                                <input type="checkbox" id="AcceptConditions1" className="peer sr-only" />

                                <span className="absolute inset-y-0 start-0 size-3 rounded-full bg-gray-300 ring-[4px] ring-white transition-all ring-inset peer-checked:start-5 peer-checked:w-2 peer-checked:bg-white peer-checked:ring-transparent dark:bg-gray-600 dark:ring-gray-900 dark:peer-checked:bg-gray-900">
                                </span>
                            </label>
                            <label htmlFor="AcceptConditions2" className="relative block h-8 w-14 rounded-full bg-gray-300 transition-colors [-webkit-tap-highlight-color:transparent] has-checked:bg-green-500 dark:bg-gray-600 dark:has-checked:bg-green-600">
                                <input type="checkbox" id="AcceptConditions2" className="peer sr-only" />

                                <span className="absolute inset-y-0 start-0 m-1 grid size-6 place-content-center rounded-full bg-white text-gray-700 transition-[inset-inline-start] peer-checked:start-6 peer-checked:*:first:hidden *:last:hidden peer-checked:*:last:block dark:bg-gray-900 dark:text-gray-200">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-4">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"></path>
                                    </svg>

                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-4">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5"></path>
                                    </svg>
                                </span>
                            </label> */}
                        <div className="flex gap-3 w-full md:w-auto md:mb-4">
                            {profile?.profile.youtube && (
                                <Link to={profile?.profile.youtube} target="_blank">
                                    <Button
                                        variant="btn_secondary"
                                        size="icon"
                                        className="rounded-full"
                                    >
                                        <Youtube className="h-5 w-5" />
                                    </Button>
                                </Link>
                            )}
                            {profile?.profile.git && (
                                <Link to={profile?.profile.git} target="_blank">
                                    <Button
                                        variant="btn_secondary"
                                        size="icon"
                                        className="rounded-full"
                                    >
                                            <Github className="h-5 w-5" />
                                    </Button>
                                </Link>
                            )}
                            {profile?.profile.twitter && (
                                <Link to={profile?.profile.twitter} target="_blank">
                                    <Button
                                        variant="btn_secondary"
                                        size="icon"
                                        className="rounded-full"
                                    >
                                        <Twitter className="h-5 w-5" />
                                    </Button>
                                </Link>
                            )}
                            {profile?.profile.linkedin && (
                                <Link to={profile?.profile.linkedin} target="_blank">
                                    <Button
                                        variant="btn_secondary"
                                        size="icon"
                                        className="rounded-full"
                                    >
                                        <Linkedin className="h-5 w-5" />
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Stats Column */}
                <div className="space-y-6">
                    <Card size='wf' variant='card_glass'>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5 nz-text-primary" />
                                Statistics
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-1">
                            <div className="flex justify-between items-center py-3 border-b border-white/5">
                                <span className="text-sm nz-foreground">
                                    Global Rank
                                </span>
                                <span className="font-mono font-bold">
                                    # {profile?.profile.global_rank || "N/A"}
                                </span>
                            </div>
                            <div className="flex justify-between items-center py-3 border-b border-white/5">
                                <span className="text-sm nz-foreground">
                                    Total Points
                                </span>
                                <span className="font-mono font-bold nz-text-primary">
                                    {profile?.profile.total_points ?? 0}
                                </span>
                            </div>
                            <div className="flex justify-between items-center py-3 border-b border-white/5">
                                <span className="text-sm nz-foreground">
                                    Missions Complete
                                </span>
                                <span className="font-mono font-bold nz-text-secondary">
                                    {profile?.profile.problems_solved || 0}
                                </span>
                            </div>
                            <div className="flex justify-between items-center py-3">
                                <span className="text-sm text-muted-foreground">
                                    Current Streak
                                </span>
                                <span className="font-mono font-bold nz-text-accent">
                                    {profile?.profile.current_streak || 0} days
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Column */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Achievements */}
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold nz-foreground">Achievements</h2>
                            <div className="px-2 py-1 rounded-full nz-background-primary border text-xs font-mono">
                                <span className="nz-text-primary font-bold">
                                    2 {/* {achievements.filter((a) => a.unlocked).length} */}
                                </span>
                                <span>
                                    UNLOCKED{/* /{achievements.length} UNLOCKED */}
                                </span>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 xl:grid-cols-4 lg:grid-cols-2 gap-4">
                            {/* {achievements.map((achievement) => (
                                <AchievementBadge key={achievement.id} {...achievement} />
                            ))} */}
                            <Card variant='card_glass'>
                                <CardHeader className='text-center'>
                                    <CardTitle>Early Bird</CardTitle>
                                </CardHeader>
                                <CardContent className='text-center'>
                                    <p className='line-clamp-2'>Complete a challenge before 8 AM</p>
                                    <ProgressBar colorClass='nz-bg-muted' label="" value={75} />
                                </CardContent>
                            </Card>
                            <Card variant='card_glass'>
                                <CardHeader className='text-center'>
                                    <CardTitle>Algorithm Master</CardTitle>
                                </CardHeader>
                                <CardContent className='text-center'>
                                    <p className='line-clamp-2'>Complete a challenge</p>
                                    <ProgressBar colorClass='nz-bg-primary' label="" value={100} />
                                </CardContent>
                            </Card>
                            <Card variant='card_glass'>
                                <CardHeader className='text-center'>
                                    <CardTitle>Bug Hunter</CardTitle>
                                </CardHeader>
                                <CardContent className='text-center'>
                                    <p className='line-clamp-2'>Complete a challenge before 8 AM</p>
                                    <ProgressBar colorClass='nz-bg-muted' label="" value={50} />
                                </CardContent>
                            </Card>
                            <Card variant='card_glass'>
                                <CardHeader className='text-center'>
                                    <CardTitle>Consistency King</CardTitle>
                                </CardHeader>
                                <CardContent className='text-center'>
                                    <p className='line-clamp-2'>Complete a challenge</p>
                                    <ProgressBar colorClass='nz-bg-primary' label="" value={100} />
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Activity Map */}
                    <Card variant='card_glass' size='wf'>
                        <CardHeader>
                            <CardTitle>Activity Log</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-1.5 flex-wrap justify-center p-4 rounded-xl border border-white/5">
                                {Array.from({
                                    length: 104,
                                }).map((_, i) => {
                                    const intensity = Math.random()
                                    let bgClass = 'bg-white/5'
                                    if (intensity > 0.9)
                                        bgClass = 'bg-primary shadow-[0_0_8px_rgba(0,245,255,0.6)]'
                                    else if (intensity > 0.7) bgClass = 'bg-primary/60'
                                    else if (intensity > 0.5) bgClass = 'bg-primary/30'
                                    return (
                                        <div
                                            key={i}
                                            className={`w-3 h-3 rounded-sm transition-all duration-300 hover:scale-150 hover:z-10 ${bgClass}`}
                                        />
                                    )
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
