import { useEffect, useState } from "react";
import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from "react-query";
import { supabaseClient } from "@lib/supabaseClient";
import {
  Spinner,
  Stack,
  ListItem,
  OrderedList,
  ListIcon,
  HStack,
  VStack,
  Flex,
  Text,
} from "@chakra-ui/react";
import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
import toast from "react-hot-toast";
import useUser from "@hooks/useUser";

import UpdateTodoModal from "./UpdateModal";

const Todos = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<{
    id: number;
    name: string;
  }>();
  const [userId, setUserId] = useState<any>();

  const queryClient = useQueryClient();
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      console.log("from todos", user);
      setUserId(user);
    }
  }, [user]);

  const { data, isLoading, isError, isSuccess } = useQuery(
    "todos",
    async () => {
      const { data, error } = await supabaseClient
        .from("todos")
        .select("*")
        .eq("user_id", userId?.id)
        .order("id", { ascending: true });

      if (error) {
        throw new Error(error.message);
      }

      console.log("data", data);

      return data;
    },
    { enabled: !!userId }
  );

  const { mutate } = useMutation(
    async (id: number) => {
      const { data, error } = await supabaseClient
        .from("todos")
        .delete()
        .match({ id });

      if (error) {
        toast.error("Something went wrong");
        return error;
      }

      return data;
    },
    {
      onSuccess: () => {
        toast.success("Item Deleted successfully");
        return queryClient.refetchQueries("todos");
      },
    }
  );

  if (isLoading) {
    return (
      <Stack>
        <Spinner size="xl" />
      </Stack>
    );
  }

  const handleUpdateModalClose = () => {
    setIsOpen(!isOpen);
  };

  const onItemClick = (todo: { id: number; name: string }) => {
    setSelectedItem(todo);
    setIsOpen(true);
  };

  const onDeleteItemClick = async (id: number) => {
    mutate(id);
  };

  return (
    <>
      <VStack>
        {data &&
          data.map((todo: any) => (
            <HStack key={todo.id} spacing="24px">
              <Flex p={6} w="300px" h="50px" justifyContent="space-between">
                <Text>{todo.name}</Text>

                <Flex w="10px">
                  <DeleteIcon
                    cursor={"pointer"}
                    color="red.500"
                    mr="2"
                    onClick={() => onDeleteItemClick(todo.id)}
                  />
                  <EditIcon
                    cursor={"pointer"}
                    onClick={() => onItemClick(todo)}
                  />
                </Flex>
              </Flex>
            </HStack>
          ))}
      </VStack>
      <UpdateTodoModal
        todo={selectedItem!}
        isOpen={isOpen}
        onClose={handleUpdateModalClose}
      />
    </>
  );
};

export default Todos;
