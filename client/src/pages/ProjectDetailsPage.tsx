import { useState } from 'react';
import { useParams } from 'wouter';
import {
    useProjectDetails,
    useCreateTask,
    useUpdateTask,
    useDeleteTask,
    useAddMember,
    useRemoveMember,
} from '@/hooks/useProjectsQuery';
import { useAuth } from '@/hooks/useAuth';
import type { TaskWithAssignee, CreateTaskData, UpdateTaskData } from '@/types/project';

export function ProjectDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const [showAddTaskModal, setShowAddTaskModal] = useState(false);
    const [showInviteModal, setShowInviteModal] = useState(false);

    const { data: project, isLoading, isError } = useProjectDetails(id || null);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (isError || !project) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Project not found</h2>
                    <a href="/projects" className="text-blue-600 hover:underline">
                        Back to projects
                    </a>
                </div>
            </div>
        );
    }

    const isOwner = project.ownerId === user?.$id;
    const isMember = project.memberIds.includes(user?.$id || '');
    const canManage = isOwner || isMember;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <a
                                    href="/projects"
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M10 19l-7-7m0 0l7-7m-7 7h18"
                                        />
                                    </svg>
                                </a>
                                <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
                                <span
                                    className={`px-3 py-1 rounded-full text-sm font-semibold ${project.status === 'active'
                                            ? 'bg-green-100 text-green-800'
                                            : project.status === 'completed'
                                                ? 'bg-blue-100 text-blue-800'
                                                : 'bg-yellow-100 text-yellow-800'
                                        }`}
                                >
                                    {project.status.replace('_', ' ')}
                                </span>
                            </div>
                            <p className="text-gray-600">{project.description}</p>
                        </div>

                        {canManage && (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowInviteModal(true)}
                                    className="px-4 py-2 bg-white border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 font-semibold"
                                >
                                    Invite Member
                                </button>
                                <button
                                    onClick={() => setShowAddTaskModal(true)}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                                >
                                    Add Task
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Overview */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Team */}
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Team</h3>
                            <div className="space-y-3">
                                {/* Owner */}
                                <div className="flex items-center gap-3">
                                    {project.owner.avatarUrl ? (
                                        <img
                                            src={project.owner.avatarUrl}
                                            alt={project.owner.fullName}
                                            className="w-10 h-10 rounded-full"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                                            {project.owner.fullName.charAt(0)}
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <p className="font-semibold text-gray-900">{project.owner.fullName}</p>
                                        <p className="text-sm text-gray-500">Owner</p>
                                    </div>
                                </div>

                                {/* Members */}
                                {project.members.map((member) => (
                                    <div key={member.$id} className="flex items-center gap-3">
                                        {member.avatarUrl ? (
                                            <img
                                                src={member.avatarUrl}
                                                alt={member.fullName}
                                                className="w-10 h-10 rounded-full"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center text-white font-semibold">
                                                {member.fullName.charAt(0)}
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <p className="font-semibold text-gray-900">{member.fullName}</p>
                                            <p className="text-sm text-gray-500">Member</p>
                                        </div>
                                        {isOwner && (
                                            <RemoveMemberButton projectId={project.$id} userId={member.$id} />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Skills */}
                        {project.skillsNeeded && project.skillsNeeded.length > 0 && (
                            <div className="bg-white rounded-xl shadow-md p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Skills Needed</h3>
                                <div className="flex flex-wrap gap-2">
                                    {project.skillsNeeded.map((skill, index) => (
                                        <span
                                            key={index}
                                            className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Milestones */}
                        {project.milestones && project.milestones.length > 0 && (
                            <div className="bg-white rounded-xl shadow-md p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Milestones</h3>
                                <div className="space-y-3">
                                    {project.milestones.map((milestone, index) => (
                                        <div key={index} className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold text-sm">
                                                {index + 1}
                                            </div>
                                            <p className="text-gray-900">{milestone}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Tasks */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-6">Tasks</h3>

                            {project.tasks.length === 0 ? (
                                <div className="text-center py-12">
                                    <svg
                                        className="w-16 h-16 text-gray-300 mx-auto mb-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                        />
                                    </svg>
                                    <p className="text-gray-600 mb-4">No tasks yet</p>
                                    {canManage && (
                                        <button
                                            onClick={() => setShowAddTaskModal(true)}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                        >
                                            Add First Task
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {project.tasks.map((task) => (
                                        <TaskItem
                                            key={task.$id}
                                            task={task}
                                            projectId={project.$id}
                                            members={[project.owner, ...project.members]}
                                            canManage={canManage}
                                            isOwner={isOwner}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* Modals */}
            {showAddTaskModal && (
                <AddTaskModal
                    projectId={project.$id}
                    members={[project.owner, ...project.members]}
                    onClose={() => setShowAddTaskModal(false)}
                />
            )}

            {showInviteModal && (
                <InviteMemberModal projectId={project.$id} onClose={() => setShowInviteModal(false)} />
            )}
        </div>
    );
}

// Task Item Component
function TaskItem({
    task,
    projectId,
    members,
    canManage,
    isOwner,
}: {
    task: any;
    projectId: string;
    members: any[];
    canManage: boolean;
    isOwner: boolean;
}) {
    const updateTaskMutation = useUpdateTask(projectId);
    const deleteTaskMutation = useDeleteTask(projectId);
    const [isEditing, setIsEditing] = useState(false);

    const assignee = members.find((m) => m.$id === task.assigneeId);

    const handleToggleComplete = async () => {
        if (!canManage) return;
        await updateTaskMutation.mutateAsync({
            taskId: task.$id,
            data: { isCompleted: !task.isCompleted },
        });
    };

    const handleDelete = async () => {
        if (!isOwner) return;
        if (confirm('Are you sure you want to delete this task?')) {
            await deleteTaskMutation.mutateAsync(task.$id);
        }
    };

    return (
        <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-3">
                {/* Checkbox */}
                <button
                    onClick={handleToggleComplete}
                    disabled={!canManage}
                    className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center ${task.isCompleted
                            ? 'bg-green-600 border-green-600'
                            : 'border-gray-300 hover:border-green-600'
                        } ${!canManage ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                >
                    {task.isCompleted && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                            />
                        </svg>
                    )}
                </button>

                {/* Content */}
                <div className="flex-1">
                    <h4
                        className={`font-semibold ${task.isCompleted ? 'line-through text-gray-500' : 'text-gray-900'
                            }`}
                    >
                        {task.title}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">{task.description}</p>

                    <div className="flex items-center gap-4 mt-3">
                        {assignee && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                    />
                                </svg>
                                <span>{assignee.fullName}</span>
                            </div>
                        )}

                        {task.dueDate && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                    />
                                </svg>
                                <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions */}
                {isOwner && (
                    <button
                        onClick={handleDelete}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                        </svg>
                    </button>
                )}
            </div>
        </div>
    );
}

// Add Task Modal
function AddTaskModal({
    projectId,
    members,
    onClose,
}: {
    projectId: string;
    members: any[];
    onClose: () => void;
}) {
    const createTaskMutation = useCreateTask();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [assigneeId, setAssigneeId] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!title.trim()) {
            setError('Title is required');
            return;
        }

        try {
            await createTaskMutation.mutateAsync({
                projectId,
                title: title.trim(),
                description: description.trim(),
                assigneeId: assigneeId || undefined,
                dueDate: dueDate || undefined,
            });
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to create task');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full">
                <div className="p-6 border-b flex items-center justify-between">
                    <h2 className="text-xl font-bold">Add New Task</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-red-800 text-sm">{error}</div>}

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Title *</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none resize-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Assign to</label>
                        <select
                            value={assigneeId}
                            onChange={(e) => setAssigneeId(e.target.value)}
                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                        >
                            <option value="">Unassigned</option>
                            {members.map((member) => (
                                <option key={member.$id} value={member.$id}>
                                    {member.fullName}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Due Date</label>
                        <input
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={createTaskMutation.isPending}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            {createTaskMutation.isPending ? 'Adding...' : 'Add Task'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Invite Member Modal
function InviteMemberModal({ projectId, onClose }: { projectId: string; onClose: () => void }) {
    const addMemberMutation = useAddMember(projectId);
    const [userId, setUserId] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!userId.trim()) {
            setError('User ID is required');
            return;
        }

        try {
            await addMemberMutation.mutateAsync(userId.trim());
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to invite member');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
                <div className="p-6 border-b flex items-center justify-between">
                    <h2 className="text-xl font-bold">Invite Member</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-red-800 text-sm">{error}</div>}

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">User ID</label>
                        <input
                            type="text"
                            value={userId}
                            onChange={(e) => setUserId(e.target.value)}
                            placeholder="Enter user ID"
                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            You can find user IDs in the user profile or search
                        </p>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={addMemberMutation.isPending}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            {addMemberMutation.isPending ? 'Inviting...' : 'Invite'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Remove Member Button
function RemoveMemberButton({ projectId, userId }: { projectId: string; userId: string }) {
    const removeMemberMutation = useRemoveMember(projectId);

    const handleRemove = async () => {
        if (confirm('Are you sure you want to remove this member?')) {
            await removeMemberMutation.mutateAsync(userId);
        }
    };

    return (
        <button
            onClick={handleRemove}
            disabled={removeMemberMutation.isPending}
            className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
        >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>
    );
}
