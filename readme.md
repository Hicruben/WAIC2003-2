使用说明

1/ 前置条件，环境安装
   - 安装Node.jS
     从 https://nodejs.org/download/release/v14.21.3/node-v14.21.3-x64.msi 下载并安装
     安装完成后，打开powershell命令行窗口（先按windows键+R，然后输入powershell）。powershell打开后，输入命令 node -v，如果出现版本号v14.21.3，说明安装成功

   - 准备三台电脑，分别用来打开左侧机器人程序，中间大屏程序，和右边机器人程序。中间大屏连接的电脑设置固定IP（比如192.168.1.110），用于作为服务器端

2/ 在中间屏连接的电脑上解压程序包。打开powershell命令行窗口（打开方式和第一步一样）。使用cd命令进入解压后的程序包里包含server.js的目录。
   - 运行服务端程序
     如果连接了Arduino控制版，使用node server.js启动程序。
     如果没有连接Arduino控制版，使用node server_withoutboard.js启动程序。
     启动程序后，命令行窗口显示“listening on *:3200”，说明程序启动成功。

3/ 在左边，中间，右边屏幕上分别打开如下三个页面url
   左边： http://127.0.0.1:3200/left
   中间： http://127.0.0.1:3200/middle
   右边： http://127.0.0.1:3200/right
