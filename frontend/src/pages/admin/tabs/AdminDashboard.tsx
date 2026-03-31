import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Code2, MessageSquareCode, Users, Activity, CheckCircle, AlertTriangle, ExternalLink, Plus } from 'lucide-react';

export default function AdminDashboard() {
    return (
        <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card size="wf">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 rounded-xl nz-background-accent">
                                <Code2 className="h-6 w-6" />
                            </div>
                            <span className="text-emerald-400 text-sm">+12%</span>
                        </div>
                        <div className="text-3xl font-bold mb-1">14</div>
                        <div className="text-sm nz-foreground">Total Challenges</div>
                    </CardContent>
                </Card>

                <Card size="wf">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
                                <MessageSquareCode className="h-6 w-6" />
                            </div>
                            <span className="text-emerald-400 text-sm">+5%</span>
                        </div>
                        <div className="text-3xl font-bold mb-1">541 071</div>
                        <div className="text-sm nz-foreground">Forum Posts</div>
                    </CardContent>
                </Card>

                <Card size="wf">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-500">
                                <Users className="h-6 w-6" />
                            </div>
                            <span className="text-emerald-400 text-sm">+24</span>
                        </div>
                        <div className="text-3xl font-bold mb-1">142</div>
                        <div className="text-sm nz-foreground">Active Users</div>
                    </CardContent>
                </Card>

                <Card size="wf">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 rounded-xl bg-green-500/10 text-green-500">
                                <Activity className="h-6 w-6" />
                            </div>
                            <CheckCircle className="h-5 w-5 text-green-500" />
                        </div>
                        <div className="text-3xl font-bold mb-1">99.9%</div>
                        <div className="text-sm nz-foreground">System Uptime</div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity + Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card size="wf" className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 nz-background-secondary rounded-xl hover:bg-white/5 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-full bg-zinc-700 flex items-center justify-center font-bold">AK</div>
                                    <div>
                                        <div className="font-medium">Cyber Security</div>
                                        <div className="text-xs nz-foreground">by Andre K • 14.03.26</div>
                                    </div>
                                </div>
                                <Button variant="btn_glass" size="sm">View</Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card size="wf">
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Button className="w-full justify-start">
                            <Plus className="h-4 w-4 mr-2" />
                            Add New Challenge
                        </Button>
                        <Button className="w-full justify-start" variant="btn_glass">
                            <AlertTriangle className="h-4 w-4 mr-2" />
                            View Reports
                        </Button>
                        <Button className="w-full justify-start" variant="btn_glass">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            System Logs
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}