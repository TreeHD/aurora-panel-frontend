import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useHistory, useLocation } from "react-router-dom";
import {
  Badge,
  Button,
  TableBody,
  TableContainer,
  Table,
  TableHeader,
  TableCell,
  TableRow,
  TableFooter,
} from "@windmill/react-ui";
import ReactLoading from "react-loading";
import { CheckCircle, WarningCircle, Plus } from "phosphor-react";

import FullScreenLoading from "../components/FullScreenLoading";
import Pagination from "../components/Pagination"
import ServerEditor from "../components/ServerEditor";
import PageTitle from "../components/Typography/PageTitle";
import Tooltip from "../components/Tooltip"
import AuthSelector from "../components/AuthSelector";
import ColoredButton from "../components/Buttons/ColoredButton";
import { getServers, getCurrentServer, connectServer } from "../redux/actions/servers";

const serverFactsToBadge = (system, permission) => {
  if (!system)
    return (
      <div className="">
        <Badge type="warning">SSH狀態未知</Badge>
        {permission === "user" ? (
          <span>請稍等片刻</span>
        ) : (
            <span>請稍等片刻或重新編輯一次服務器以觸發服務器狀態更新</span>
          )}
      </div>
    );
  if (!system.os_family)
    return (
      <div className="">
        <Badge type="warning">SSH連接失敗</Badge>
        {permission === "user" ? (
          <span>請通知管理員檢查SSH連接信息</span>
        ) : (
            <span className="">{system.msg}</span>
          )}
      </div>
    );
  return (
    <div className="">
      <Badge type="success">SSH連接成功</Badge>
      <span>{`${system.distribution} ${system.distribution_version} (${system.distribution_release}) ${system.architecture}`}</span>
    </div>
  );
};

function Servers() {
  const location = useLocation();
  const { servers, loading } = useSelector((state) => state.servers.servers);
  const query = new URLSearchParams(location.search)
  const page = parseInt(query.get("page") || 1);
  const size = parseInt(query.get('size') || servers.size || 20);

  const permission = useSelector((state) => state.auth.permission);

  const [editorOpen, setEditorOpen] = useState(false);

  const dispatch = useDispatch();
  const history = useHistory();

  useEffect(() => {
    dispatch(getServers(page, size))
  }, [dispatch, page, size]);

  useEffect(() => {
    if (!loading && servers && servers.items) {
      servers.items.forEach(s => {
        if (!s.config.system) {
          dispatch(connectServer(s.id, {}))
        }
      })
    }
    // eslint-disable-next-line
  }, [dispatch, loading])

  return (
    <>
      <div className="flex justify-between items-center">
        <PageTitle>Servers</PageTitle>
        <AuthSelector permissions={["admin"]} >
          <Button
            size="regular"
            iconLeft={Plus}
            onClick={() => {
              dispatch(getCurrentServer(-1));
              setEditorOpen(true);
            }}
          >
            添加
          </Button>
        </AuthSelector>
      </div>
      <ServerEditor
        isModalOpen={editorOpen}
        setIsModalOpen={setEditorOpen}
      />
      {loading ? <FullScreenLoading />
        : <TableContainer>
          <Table>
            <TableHeader>
              <tr>
                <TableCell>名字</TableCell>
                <TableCell>地址</TableCell>
                <AuthSelector permissions={['admin', 'ops']}>
                  <TableCell>端口</TableCell>
                </AuthSelector>
                <TableCell>SSH狀態</TableCell>
                <TableCell>動作</TableCell>
              </tr>
            </TableHeader>
            <TableBody>
              {servers.items.map((server) => (
                <TableRow key={`servers_server_${server.id}`}>
                  <TableCell>
                    <span className="text-sm">{server.name}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{server.address}</span>
                  </TableCell>
                  <AuthSelector permissions={['admin', 'ops']}>
                    <TableCell>
                      <span className="text-sm">
                        {server.ports ? server.ports.filter(p => p.allowed_users.length > 0).length : "X"}
                      /
                      {server.ports ? server.ports.length : "X"}
                      </span>
                    </TableCell>
                  </AuthSelector>
                  <TableCell>
                    <Tooltip tip={serverFactsToBadge(server.config.system, permission)}>
                      <Button
                        size="smaill"
                        layout="link"
                        onClick={e => { e.preventDefault(); dispatch(connectServer(server.id, {})) }}
                      >
                        {server.config.system ? (
                          !server.config.system.os_family ? (
                            <WarningCircle weight="bold" size={20} />
                          ) : (
                              <CheckCircle weight="bold" size={20} />
                            )
                        ) : (
                            <ReactLoading
                              height={20}
                              width={20}
                              type="spinningBubbles"
                              color="#000"
                            />
                          )}
                      </Button>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-start space-x-1">
                      <ColoredButton
                        onClick={() => {
                          history.push(`/app/servers/${server.id}/ports`);
                        }}
                      >
                        查看端口/新增轉發
                    </ColoredButton>
                      <AuthSelector permissions={['admin', 'ops']}>
                        <ColoredButton
                          onClick={() =>
                            history.push(`/app/servers/${server.id}/users`)
                          }
                        >
                          查看用户
                        </ColoredButton>
                        <ColoredButton
                          onClick={() => {
                            dispatch(getCurrentServer(server.id, true));
                            setEditorOpen(true);
                          }}
                        >
                          編輯服務器
                        </ColoredButton>
                      </AuthSelector>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TableFooter>
            <Pagination
              totalResults={parseInt(servers.total)}
              resultsPerPage={parseInt(servers.size)}
              currentPage={page}
              onChange={(p) => { p !== page && history.push(`/app/servers?page=${p}&size=${size}`) }}
              label="Servers"
            />
          </TableFooter>
        </TableContainer>}
    </>
  );
}

export default Servers;
