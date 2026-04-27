import React, { useState, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../providers/MessageProvider'
import { Code2, Mail, Lock, AlertCircle, GithubIcon, ChromeIcon } from 'lucide-react'


export function Login() {
    const navigate = useNavigate()
    const { login } = useAuth()
    const { showToast } = useToast()
    const hasShown = useRef(false);

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setIsLoading(true)
        try {
            await login(email, password)
            navigate('/')
        } catch (err) {
            setError('Invalid email or password')
            if (!hasShown.current) {
                showToast('error', 'Login failed', 'Please check your credentials and try again.')
                hasShown.current = true;
            }
        } finally {
            setIsLoading(false)
        }
    }
    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/5 to-secondary/5" />

            <div className="w-full max-w-md relative z-10">
                <Card className="glass-strong border-primary/20 shadow-2xl">
                    <CardHeader className="text-center space-y-4">
                        <div className="mx-auto h-16 w-16 rounded-2xl text-black bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center shadow-lg">
                            <Code2 className="h-8 w-8 text-background" />
                        </div>
                        <CardTitle className="text-3xl font-bold nz-foregraund"> {/* bg-gradient-to-r from-cyan-500 to-purple-500 text-transparent bg-clip-text */}
                            Welcome Back
                        </CardTitle>
                        <p className='font-semibold nz-text-muted'>
                            Sign in to continue your coding journey
                        </p>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <div className="glass p-3 rounded-xl border border-red-500/30 flex items-center gap-2 text-red-400">
                                    <AlertCircle className="h-4 w-4 shrink-0" />
                                    <span className="text-sm">{error}</span>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">
                                    E-mail
                                </label>
                                <Input
                                    type="email"
                                    name="email"
                                    placeholder="your@email.com"
                                    icon={<Mail className="h-4 w-4" />}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">
                                    Password
                                </label>
                                <Input
                                    type="password"
                                    name="password"
                                    placeholder="••••••••"
                                    icon={<Lock className="h-4 w-4" />}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="flex items-center justify-between text-sm">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 rounded border-white/20 bg-transparent checked:bg-primary"
                                    />
                                    <span className="text-foreground/70">Remember me</span>
                                </label>
                                <a href="#" className="text-cyan-500 hover:text-cyan-400">
                                    Forgot password?
                                </a>
                            </div>

                            <div className="p-[2px] rounded-lg bg-gradient-to-br from-cyan-500 to-pink-500 hover:from-cyan-600 hover:to-pink-600 transition">
                                <Button
                                    type="submit"
                                    variant="btn_primary"
                                    size="wf"
                                    isLoading={isLoading}
                                    className="w-full h-full px-6 py-2 rounded-lg bg-white text-black hover:bg-gradient-to-br hover:from-cyan-600 hover:to-pink-600 hover:text-white transition-colors duration-300"
                                >
                                    Sign In
                                </Button>
                            </div>
                            <p className="text-center text-sm font-semibold text-foreground/70">
                                Don't have an account?{' '}
                                <Link
                                    to="/register"
                                    className="text-blue-400 hover:text-blue-500 font-semibold"
                                >
                                    Sign up
                                </Link>
                            </p>
                        </form>
                        <div className="flex items-center w-full my-6">
                            <hr className="flex-grow border-black" />
                            <span className="mx-4 text-sm font-medium nz-text-muted whitespace-nowrap">
                                Or continue with
                            </span>
                            <hr className="flex-grow border-black" />
                        </div>
                        <div className='flex justify-center mt-6'>
                            <div className="w-fit nz-background-muted flex justify-center items-center gap-2 text-sm text-foreground/70 rounded-full p-1">
                                <Button
                                    variant="btn_primary"
                                    size='sm'
                                    className='rounded-full'
                                    onClick={() =>
                                        window.location.assign(`https://github.com/login/oauth/authorize?client_id=Ov23litWAwe4QveF02LR&redirect_uri=http://localhost:8000/user/auth/github/callback/&scope=read:user user:email`)
                                    }
                                    >
                                    <GithubIcon className="mr-2 h-4 w-4" /> GitHub
                                </Button>
                                <Button
                                    variant="btn_primary"
                                    size='sm'
                                    className='rounded-full'
                                    onClick={() =>
                                        window.location.assign(`https://accounts.google.com/o/oauth2/v2/auth?client_id=751543173067-ln2sp1ig09oa5kit9rlloa5htdd9qog7.apps.googleusercontent.com&redirect_uri=http://localhost:8000/user/auth/google/callback/&response_type=code&scope=openid profile email`)
                                    }
                                    >
                                    <ChromeIcon className="mr-2 h-4 w-4" /> Google
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
//!<.
// (venv) PS C:\ProgramData\Microsoft\UpdateCache\Project_22\backend> python manage.py createsuperuser
// Username (leave blank to use 'user'): Administrator
// Email address: administrator@email.com
// Password: MM+Zkekh+q58
// Password (again): MM+Zkekh+q58
// Superuser created successfully.
// (venv) PS C:\ProgramData\Microsoft\UpdateCache\Project_22\backend>
//?>.
//txt, pdf, md, json, xml, csv, yml, yaml, pem, env, sqlite3, db, sh, bat, ini, py, go, dart, rs, kt, swift, java, js, ts, jsx, tsx, html, htm, css, c, cpp
//?>.
//!>.
//TODO: Доробити гарну синю тему.
// h&XP#*UT,7U_ - martaya[s<z>]h@email.com
// -> A)-6t7$9bM(& - andre@gmail.com
// AksdmCKTyYwKa4CbL_mKKA - nezerhillfoundation@gmail.com
// MM+Zkekh+q58 - nazzych666@gmail.com
//→ h&XP#*UT,7U_MM+Zkekh+q58 - github oauth.
//!>.