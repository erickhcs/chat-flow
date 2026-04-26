import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import useUserContext from "@/contexts/hooks/user";
import { SquareArrowRightExit } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const LogoutAction = () => {
  const { setUser, setIsAuthenticated, setToken } = useUserContext();
  const [isOpenLogoutDialog, setIsOpenLogoutDialog] = useState(false);
  const navigate = useNavigate();

  const handleClickLogoutButton = () => {
    setIsOpenLogoutDialog(true);
  };

  const handleConfirmLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setIsAuthenticated(false);
    setToken(null);

    navigate("/login");
  };

  return (
    <>
      <Button
        onClick={handleClickLogoutButton}
        variant="outline"
        size="icon"
        className="cursor-pointer"
      >
        <SquareArrowRightExit />
      </Button>
      <Dialog open={isOpenLogoutDialog} onOpenChange={setIsOpenLogoutDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Logout</DialogTitle>
            <DialogDescription>
              Are you sure you want to logout?
            </DialogDescription>
            <div className="flex gap-2 mt-4">
              <DialogClose asChild>
                <Button
                  variant="outline"
                  onClick={() => setIsOpenLogoutDialog(false)}
                  className="cursor-pointer"
                >
                  Cancel
                </Button>
              </DialogClose>

              <Button onClick={handleConfirmLogout} className="cursor-pointer">
                Logout
              </Button>
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default LogoutAction;
