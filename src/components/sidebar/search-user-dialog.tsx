import { useSession } from '@/lib/auth-client';
import { createChatFn } from '@/lib/fn/chat-fn';
import { searchUserFn } from '@/lib/fn/user-fn';
import { UserSelect } from '@/server/db/schema';
import { useNavigate } from '@tanstack/react-router';
import { Search, Send, UserPlus, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '../ui/command';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

export function SearchUserDialog() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<UserSelect[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<UserSelect[]>([]);
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
            error instanceof Error ? error.message : 'An error occurred while searching for users.',
          );
          setUsers([]);
          setSelectedUsers([]);
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
      setSelectedUsers([]);
    }
  };

  const handleChatCreate = async (
    participantsIds: string[],
    currentUserId: string,
    type: 'private' | 'group',
  ) => {
    try {
      const result = await createChatFn({
        data: {
          participantIds: [currentUserId, ...participantsIds],
          type,
        },
      });
      setOpen(false);
      setSearch('');
      setUsers([]);
      setSelectedUsers([]);
      navigate({ to: `/chat/${result}` });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create chat.');
    }
  };

  return (
    <>
      <div
        className="hover:text-primary hover:bg-muted-foreground/20 cursor-pointer rounded-md p-2 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <Search size={20} strokeWidth={2.5} />
      </div>
      <CommandDialog open={open} onOpenChange={handleOpenChange}>
        <CommandInput placeholder="Search for a user..." value={search} onValueChange={setSearch} />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {users.length > 0 && (
            <CommandGroup heading="Found users">
              {users.map((user) => (
                <CommandItem
                  key={user.id}
                  value={user.name}
                  className="flex cursor-pointer items-center"
                >
                  <Avatar>
                    <AvatarImage src={user.image ?? undefined} />
                    <AvatarFallback>{user.name.charAt(0) ?? 'U'}</AvatarFallback>
                  </Avatar>
                  <span className="ml-2 flex-1">{user.name}</span>
                  <Button
                    size={'icon'}
                    onClick={() => {
                      if (selectedUsers.find((u) => u.id === user.id)) return;
                      setSelectedUsers((prev) => [...prev, user]);
                    }}
                  >
                    <UserPlus className="text-primary-foreground" />
                  </Button>
                  <Button
                    size={'icon'}
                    onClick={() =>
                      handleChatCreate(
                        selectedUsers.map((user) => user.id),
                        session.data!.user!.id,
                        'private',
                      )
                    }
                  >
                    <Send className="text-primary-foreground" />
                  </Button>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
        {selectedUsers.length > 0 && (
          <div className="flex">
            <div className="flex flex-1 flex-wrap items-center gap-2 p-4">
              {selectedUsers.map((user) => (
                <Badge
                  key={user.id}
                  className="hover:bg-accent-foreground/50 flex cursor-pointer items-center gap-1 transition-colors duration-100"
                  onClick={() => setSelectedUsers((prev) => prev.filter((u) => u.id !== user.id))}
                >
                  {user.name}
                  <X data-icon="inline-end" />
                </Badge>
              ))}
            </div>
            <div className="flex justify-end p-4">
              <Button
                onClick={() =>
                  handleChatCreate(
                    selectedUsers.map((user) => user.id),
                    session.data!.user!.id,
                    'group',
                  )
                }
                size={'sm'}
                disabled={selectedUsers.length < 2}
              >
                Create group
              </Button>
            </div>
          </div>
        )}
      </CommandDialog>
    </>
  );
}
