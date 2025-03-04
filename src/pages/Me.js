import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Input,
  Label,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@windmill/react-ui";

import FullScreenLoading from "../components/FullScreenLoading"
import PageTitle from "../components/Typography/PageTitle";
import SectionTitle from "../components/Typography/SectionTitle";
import { getMe, editMe } from "../redux/actions/users";


function Me() {
  const me = useSelector((state) => state.users.me);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [prevPassword, setPrevPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [repeatedNewPassword, setRepeatedNewPassword] = useState("");
  const validPrevPassword = () => !prevPassword || prevPassword.length > 0;
  const validNewPassword = () => !newPassword || newPassword.length > 5;
  const validRepeatedNewPassword = () =>
    !newPassword || repeatedNewPassword === newPassword;
  const validForm = () => prevPassword && newPassword && repeatedNewPassword && validPrevPassword() && validNewPassword() && validRepeatedNewPassword();
  const dispatch = useDispatch();

  const submitForm = () => {
    if (validForm()) {
      const data = {
        prev_password: prevPassword,
        new_password: newPassword
      }
      dispatch(editMe(data))
    }
    setPrevPassword("");
    setNewPassword("");
    setRepeatedNewPassword("");
    setIsPasswordModalOpen(false);
  }

  useEffect(() => {
    dispatch(getMe());
    setPrevPassword("");
    setNewPassword("");
    setRepeatedNewPassword("");
  }, [dispatch]);

  if (!me)
    return <FullScreenLoading />;
  return (
    <>
      <Modal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      >
        <ModalHeader>修改密碼</ModalHeader>
        <ModalBody>
          <div className="px-4 py-3 mb-8 bg-white rounded-lg shadow-md dark:bg-gray-800">
            <Label className="mt-4">
              <span>原密碼</span>
              <Input
                className="mt-1"
                type="password"
                value={prevPassword}
                onChange={(e) => setPrevPassword(e.target.value)}
                valid={validPrevPassword()}
              />
            </Label>
            <Label className="mt-4">
              <span>新密碼</span>
              <Input
                className="mt-1"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                valid={validNewPassword()}
              />
            </Label>
            <Label className="mt-4">
              <span>再輸入一次新密碼</span>
              <Input
                className="mt-1"
                type="password"
                value={repeatedNewPassword}
                onChange={(e) => setRepeatedNewPassword(e.target.value)}
                valid={validRepeatedNewPassword()}
              />
            </Label>
          </div>
        </ModalBody>
        <ModalFooter>
          <div className="">
            <Button
              layout="outline"
              onClick={() => setIsPasswordModalOpen(false)}
            >
              Cancel
            </Button>
          </div>
          <div className="">
            <Button disabled={!validForm()} onClick={submitForm}>OK</Button>
          </div>
        </ModalFooter>
      </Modal>
      <PageTitle>{me.email}</PageTitle>

      <SectionTitle>密碼</SectionTitle>
      <div>
        <Button onClick={() => setIsPasswordModalOpen(true)}>修改密碼</Button>
      </div>
    </>
  );
}

export default Me;
