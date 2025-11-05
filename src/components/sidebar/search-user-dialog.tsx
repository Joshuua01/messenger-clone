import { useEffect, useState } from 'react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '../ui/command';
import { Search } from 'lucide-react';
import { searchUserFn } from '@/lib/fn/user-fn';
import { UserSelect } from '@/server/db/schema';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useSession } from '@/lib/auth-client';
import { createPrivateConversationFn } from '@/lib/fn/conversation-fn';
import { useNavigate } from '@tanstack/react-router';

export function SearchUserDialog() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<UserSelect[]>([]);
  const session = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (search && open) {
      const searchUsers = async () => {
        try {
          const results = await searchUserFn({ data: search });
          setUsers(results);
        } catch (error) {
          toast.error(
            error instanceof Error
              ? error.message
              : 'An error occurred while searching for users.',
          );
          setUsers([]);
        }
      };
      const timeoutId = setTimeout(searchUsers, 300);
      return () => clearTimeout(timeoutId);
    } else {
      setUsers([]);
    }
  }, [search, open]);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setSearch('');
      setUsers([]);
    }
  };

  const handleConversationCreate = async (
    userId: string,
    currentUserId: string,
  ) => {
    try {
      const result = await createPrivateConversationFn({
        data: {
          participantIds: [userId, currentUserId],
        },
      });
      toast.success('Conversation created successfully');
      setOpen(false);
      setSearch('');
      setUsers([]);
      navigate({ to: `/chat/${result}` });
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to create conversation.',
      );
    }
  };

  return (
    <>
      <div
        className="hover:text-primary hover:bg-muted-foreground/20 p-2 rounded-md cursor-pointer transition-colors"
        onClick={() => setOpen(!open)}
      >
        <Search size={20} strokeWidth={2.5} />
      </div>
      <CommandDialog open={open} onOpenChange={handleOpenChange}>
        <CommandInput
          placeholder="Search for a user..."
          value={search}
          onValueChange={setSearch}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {users.length > 0 && (
            <CommandGroup heading="Found users">
              {users.map((user) => (
                <CommandItem
                  key={user.id}
                  value={user.name}
                  onSelect={() =>
                    handleConversationCreate(user.id, session.data!.user!.id)
                  }
                  className="cursor-pointer"
                >
                  <Avatar>
                    <AvatarImage src={user.image ?? undefined} />
                    <AvatarFallback>
                      {user.name.charAt(0) ?? 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="ml-2">{user.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
