// // src/components/calendar/reminder-form.tsx
// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { useCreateReminder } from "@/hooks/useReminders";
// import { Label } from "@/components/ui/label";
// import { Input } from "@/components/ui/input";
// import { DateTimePicker } from "@/components/ui/date-time-picker"; // You may need to implement this

// interface ReminderFormProps {
//   taskId: number;
//   onSuccess: () => void;
//   onCancel: () => void;
// }

// export function ReminderForm({ taskId, onSuccess, onCancel }: ReminderFormProps) {
//   const [dateTime, setDateTime] = useState<Date>(new Date());
//   const createReminder = useCreateReminder();

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     createReminder.mutate({
//       task: taskId,
//       reminder_time: dateTime.toISOString(),
//     }, {
//       onSuccess: () => onSuccess()
//     });
//   };

//   return (
//     <form onSubmit={handleSubmit} className="space-y-4">
//       <div className="space-y-2">
//         <Label htmlFor="reminder-time">Reminder Time</Label>
//         <DateTimePicker 
//           value={dateTime}
//           onChange={setDateTime}
//         />
//       </div>
//       <div className="flex justify-end gap-2">
//         <Button type="button" variant="outline" onClick={onCancel}>
//           Cancel
//         </Button>
//         <Button type="submit">
//           Set Reminder
//         </Button>
//       </div>
//     </form>
//   );
// }