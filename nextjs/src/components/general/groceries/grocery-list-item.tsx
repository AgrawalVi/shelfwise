import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Item } from "@prisma/client"
import { format } from "date-fns"
import EditGroceryButton from "@/components/forms/edit-grocery-button"
import DeleteGroceryButton from "@/components/forms/delete-grocery-button"

export default function GroceryListItem({ grocery }: { grocery: Item }) {
  return (
    <Popover>
      <PopoverTrigger>
        <Card className="flex justify-between px-5 py-4 items-center">
          <div className="text-2xl capitalize text-left pr-2">
            {grocery.name}
          </div>
          {grocery.expiresAt ? (
            <div className="flex flex-col items-center justify-center bg-white/50 rounded-lg px-3 py-1">
              <div className="uppercase text-sm">
                {format(grocery.expiresAt.toLocaleDateString(), "LLL")}
              </div>
              <div>{format(grocery.expiresAt.toLocaleDateString(), "d")}</div>
            </div>
          ) : (
            <Badge variant="default">No Expiry</Badge>
          )}
        </Card>
      </PopoverTrigger>
      <PopoverContent
        sideOffset={6}
        align="end"
        className="w-auto p-3 space-x-3"
      >
        <EditGroceryButton grocery={grocery} />
        <DeleteGroceryButton groceryId={grocery.id} />
      </PopoverContent>
    </Popover>
  )
}
