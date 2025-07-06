import React, { useState } from "react";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { useTaskComments, useCreateComment, useTaskAttachments, useUploadAttachment } from "@/hooks/useTasks";

interface TaskProjectDetailsProps {
  task: any;
  getInitials: (userId: number | null | undefined) => string;
  getAssigneeEmail: (userId: number | null | undefined) => string;
  getPriorityProps: (priority: number | undefined) => { label: string; color: string };
}

const TaskProjectDetails: React.FC<TaskProjectDetailsProps> = ({ task, getInitials, getAssigneeEmail, getPriorityProps }) => {
  if (!task) return null;
  return (
    <>
      <DialogHeader>
        <DialogTitle>{task.title}</DialogTitle>
      </DialogHeader>
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="comments">Comments</TabsTrigger>
          <TabsTrigger value="attachments">Attachments</TabsTrigger>
        </TabsList>
        <TabsContent value="details" className="mt-4 space-y-4">
          <div>
            <h4 className="font-medium mb-2">Description</h4>
            <p className="text-sm text-muted-foreground">{task.description}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-1">Assignee</h4>
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback className="text-xs">{getInitials(task.assigned_to)}</AvatarFallback>
                </Avatar>
                <span className="text-sm">{getAssigneeEmail(task.assigned_to)}</span>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-1">Due Date</h4>
              <p className="text-sm text-muted-foreground">
                {task.due_date ? format(parseISO(task.due_date), "MMM d, yyyy 'at' h:mm a") : '-'}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-1">Priority</h4>
              <Badge variant="outline" className={cn("text-xs", getPriorityProps(task.priority).color)}>
                {getPriorityProps(task.priority).label}
              </Badge>
            </div>
            <div>
              <h4 className="font-medium mb-1">Status</h4>
              <Badge variant="outline" className="text-xs">
                {task.status?.replace("_", " ")}
              </Badge>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="comments" className="mt-4">
          <CommentsSection 
            taskId={task.id} 
            getInitials={getInitials}
            getAssigneeEmail={getAssigneeEmail}
          />
        </TabsContent>
        {/* AttachmentsSection must be declared before use to avoid hoisting issues */}
        <TabsContent value="attachments" className="mt-4">
          {/** @ts-ignore-next-line: AttachmentsSection is declared below, so move it above TaskProjectDetails if needed */}
          <AttachmentsSection taskId={task.id} getInitials={getInitials} />
        </TabsContent>
      </Tabs>
    </>
  );
// --- Attachments Section ---
interface AttachmentsSectionProps {
  taskId: number;
  getInitials: (userId: number | null | undefined) => string;
}

function AttachmentsSection({ taskId, getInitials }: AttachmentsSectionProps) {
  const { data: attachments = [], isLoading } = useTaskAttachments(String(taskId));
  const uploadAttachment = useUploadAttachment();
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      await uploadAttachment.mutateAsync({ taskId: String(taskId), file, description });
      setFile(null);
      setDescription("");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Attachments</h4>
        <div className="flex gap-2 items-center">
          <input
            type="file"
            id="file-upload"
            className="hidden"
            onChange={handleFileChange}
            disabled={uploading}
          />
          <label htmlFor="file-upload">
            <Button size="sm" variant="outline" asChild>
              <span>{file ? "Change File" : "Upload File"}</span>
            </Button>
          </label>
          {file && (
            <>
              <input
                type="text"
                className="border rounded px-2 py-1 text-xs ml-2"
                placeholder="Description (optional)"
                value={description}
                onChange={e => setDescription(e.target.value)}
                disabled={uploading}
              />
              <Button size="sm" variant="default" onClick={handleUpload} disabled={uploading} className="ml-2">
                {uploading ? "Uploading..." : "Save"}
              </Button>
            </>
          )}
        </div>
      </div>
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {isLoading ? (
          <div>Loading attachments...</div>
        ) : attachments.length === 0 ? (
          <div className="text-muted-foreground text-sm">No attachments yet.</div>
        ) : (
          attachments.map((attachment) => (
            <div key={attachment.id} className="border rounded p-2 bg-muted flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Avatar className="h-5 w-5">
                  <AvatarFallback className="text-xs">{getInitials(attachment.uploaded_by)}</AvatarFallback>
                </Avatar>
                <span className="text-xs font-medium">{attachment.original_filename || attachment.file}</span>
                {attachment.description && <span className="text-xs text-muted-foreground ml-2">{attachment.description}</span>}
                <span className="text-xs text-muted-foreground ml-2">{attachment.uploaded_at ? format(parseISO(attachment.uploaded_at), "MMM d, yyyy h:mm a") : ""}</span>
              </div>
              <a
                href={attachment.file}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto text-xs text-blue-600 hover:underline"
                download
              >
                Download
              </a>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
};


// --- Comments Section ---
interface CommentsSectionProps {
  taskId: number;
  getInitials: (userId: number | null | undefined) => string;
  getAssigneeEmail: (userId: number | null | undefined) => string;
}

const CommentsSection: React.FC<CommentsSectionProps> = ({ taskId, getInitials, getAssigneeEmail }) => {
  const { data: comments = [], isLoading } = useTaskComments(String(taskId));
  const createComment = useCreateComment();
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    setSubmitting(true);
    try {
      await createComment.mutateAsync({
        taskId: String(taskId),
        comment: { text: commentText },
      });
      setCommentText("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Comments</h4>
      </div>
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {isLoading ? (
          <div>Loading comments...</div>
        ) : comments.length === 0 ? (
          <div className="text-muted-foreground text-sm">No comments yet.</div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="border rounded p-2 bg-muted">
              <div className="flex items-center gap-2 mb-1">
                <Avatar className="h-5 w-5">
                  <AvatarImage src={"/placeholder.svg"} />
                  <AvatarFallback className="text-xs">{getInitials(comment.author)}</AvatarFallback>
                </Avatar>
                <span className="text-xs font-medium">{getAssigneeEmail(comment.author)}</span>
                <span className="text-xs text-muted-foreground ml-2">{comment.created_at ? format(parseISO(comment.created_at), "MMM d, yyyy h:mm a") : ""}</span>
              </div>
              <div className="text-sm">{comment.text}</div>
            </div>
          ))
        )}
      </div>
      <div className="flex gap-2 mt-2">
        <input
          type="text"
          className="flex-1 border rounded px-2 py-1 text-sm"
          placeholder="Add a comment..."
          value={commentText}
          onChange={e => setCommentText(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") handleAddComment(); }}
          disabled={submitting}
        />
        <Button size="sm" variant="outline" onClick={handleAddComment} disabled={submitting || !commentText.trim()}>
          {submitting ? "Adding..." : "Add"}
        </Button>
      </div>
    </div>
  );
};

export default TaskProjectDetails;
