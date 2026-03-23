import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { ProgressBar } from '../components/ui/ProgressBar'
import { useProfile } from '../contexts/ProfileContext';
import { Link } from 'react-router-dom'
import { ArrowRight, Crown, Code2, Trophy, Flame, Target, LayoutDashboard } from 'lucide-react'

export function Dashboard() {
    const { profile } = useProfile();
    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold nz-foreground flex items-center gap-3">
                        <LayoutDashboard className="h-8 w-8" />
                        Dashboard
                    </h1>
                    <p className="nz-foreground mt-1">
                        Short information about your progress
                    </p>
                </div>
            </div>

            {/* 3 картки статистики — захардкоджені значення dark:bg-zinc-900 dark:text-cyan-400 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card size='wf' className="h-full">
                    <CardContent className="p-4 flex flex-col justify-between h-full">
                        <div className="flex items-center justify-between w-full">
                            <span className="text-sm font-semibold nz-foreground">Total Points</span>
                            <div className="p-2 rounded-md nz-bg-primary nz-text-primary">
                                <Trophy className="h-6 w-6" />
                            </div>
                        </div>
                        <div className="text-3xl font-bold nz-text-primary flex items-center">
                            {profile?.profile.total_points ?? 0}
                            {Number(profile?.profile.total_points) <= 10 && (
                                <span className="ml-2 text-lg">😭</span>
                            )}
                        </div>
                        <p className="text-sm nz-foreground mt-2">Keep solving to earn more!</p>
                    </CardContent>
                </Card>

                {/* Current Streak */}
                <Card size='wf' className="h-full">
                    <CardContent className="p-4 flex flex-col justify-between h-full">
                        <div className="flex items-center justify-between w-full">
                            <span className="text-sm font-semibold nz-foreground">Current Streak</span>
                            <div className="p-2 rounded-md nz-bg-secondary nz-text-secondary">
                                <Flame className="h-6 w-6" />
                            </div>
                        </div>
                        <span className="text-3xl font-bold nz-text-secondary">7 Days</span>
                        <p className="text-sm nz-foreground mt-2">Keep it up!</p>
                    </CardContent>
                </Card>

                {/* Weekly Goal */}
                <Card size='wf' className="h-full">
                    <CardContent className="p-4 flex flex-col justify-between h-full">
                        <div className="flex items-center justify-between w-full">
                            <span className="text-sm font-semibold nz-foreground">Challenges Solved</span>
                            <div className="p-2 rounded-md nz-bg-accent nz-text-accent">
                                <Target className="h-6 w-6" />
                            </div>
                        </div>
                        <span className="text-3xl font-bold nz-text-accent">18</span>
                        <p className="text-sm nz-foreground mt-2">3 / 5 this week</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Ліва частина — 2/3 екрану */}
                <div className="lg:col-span-2">
                    <h1 className='flex flex-row items-center nz-text-primary gap-2 ml-1 mb-4 text-xl font-bold'>
                        <Crown className="h-5 w-5" />
                        Топ гравців
                    </h1>
                    <Card size='wf'>
                        <CardContent className="space-y-6 mt-6">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="text-center p-4 border rounded-lg nz-background-primary nz-text-primary">
                                        {/* <Avatar className="mx-auto mb-3" fallback={`#${i}`} /> */}
                                        <div className="font-medium">Гравець {i}</div>
                                        <div className="text-sm nz-foreground">8{5 - i}0 балів</div>
                                    </div>
                                ))}
                            </div>
                            {/* Ти сам */}
                            <div className="w-full p-4 border rounded-lg flex items-center justify-between nz-background-accent nz-text-accent">
                                <div className="flex items-center gap-4">
                                    <div className="text-center">
                                        <div className="text-sm nz-foreground">Місце</div>
                                        <div className="text-2xl font-bold">#18</div>
                                    </div>
                                    {/* <Avatar fallback="You" /> */}
                                    <div>
                                        <div className="font-medium">Ви</div>
                                        <div className="text-sm nz-foreground">Продовжуй</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xl font-bold">4,320</div>
                                    <div className="text-sm nz-foreground">балів</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Активні задачі — заглушки */}
                    <div className='mt-8'>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold flex items-center gap-2 nz-text-primary ml-1 text-xl font-bold">
                                <Code2 className="h-5 w-5" />
                                Активні задачі
                            </h2>
                            <Link to="/challenges" className='flex flex-row items-center gap-2'>
                                <Button variant="btn_glass" size="sm">
                                    Усі <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[1, 2].map((i) => (
                                <Card size='wf'
                                    key={i}
                                    title={`Задача-приклад ${i}`}>
                                        <CardContent className="pt-6 text-center">
                                            <h3 className="text-left font-semibold mb-4">{i}</h3>
                                            <p className='text-lg font-semibold'>Given the head of a singly linked list, reverse the list, and return the reversed list.</p>
                                        </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Права колонка — віджети */}
                <div className="space-y-3.5 lg:col-span-1">
                    {/* Навички */}
                    <h1 className='flex flex-row items-center nz-text-primary ml-1 text-xl font-bold'>
                        Навички
                    </h1>
                    <Card size='wf' variant='card_primary'>
                        <CardContent className="space-y-10 pt-7">
                            <ProgressBar colorClass='nz-bg-primary' label="JavaScript" value={75} />
                            <ProgressBar colorClass='nz-bg-secondary' label="React" value={60} />
                            <ProgressBar colorClass='nz-bg-accent' label="Algorithms" value={45} />
                        </CardContent>
                    </Card>

                    {/* Тижневий прогрес — круглий індикатор захардкоджений */}
                    <Card size='wf' variant='card_primary'>
                        <CardContent className="pt-6 text-center">
                            <h3 className="font-semibold mb-4">Тижнева ціль</h3>
                            <div className='flex flex-row'>
                                <div className="mx-auto w-28 h-28 rounded-full border-8 nz-border"></div>
                                <div>
                                    <div className='flex items-center justify-center'>
                                        <div className="text-3xl font-bold nz-text-accent">3</div>
                                        <div className="text-md nz-foreground">
                                            з 5
                                        </div>
                                    </div>
                                    <p className="mt-8 text-sm nz-foreground">
                                        Залишилось <span className='font-bold nz-text-secondary'>2</span> задачі
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}