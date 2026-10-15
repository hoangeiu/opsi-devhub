import { toast } from "@/components/ui/toast";

function toastSuccess(title: string, description: string, actionText?: string) {
  toast.add({
    positionerProps: {
      side: "left",
      align: "center",
      positionMethod: "absolute",
    },

    type: "success",
    title: title,
    description: description,
  });
}

export { toastSuccess };
