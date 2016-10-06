## 本地
PostgreSQL 光要让它跑起来就挺麻烦的，Mac 上很方便，就 `brew install postgresql`，然后 `initdb /usr/local/var/postgres -E utf8` 初始化数据库。

我在 `~/.zshrc` 里面设置了两个 alias 快速启动停止：

``` zsh
alias pgstart="pg_ctl -D /usr/local/var/postgres -l /usr/local/var/postgres/server.log start"
alias pgstop="pg_ctl -D /usr/local/var/postgres stop -s -m fast"
```

还有个非常好用的命令行工具 [pgcli](https://github.com/dbcli/pgcli/)，有自动补全命令功能。

`brew services` 也能设置开机启动和手动启动停止。

Mac 上有个坑就是 PostgreSQL 版本不同需要迁移数据，这个好解决，随便 Google 下就行了。

## VPS
### 安装 创建用户 密码
debian 的 VPS 上直接 `sudo apt-get install postgresql` 就行了，我也不知道为什么刚开始我这么装了之后，安装成功，但是根本没启动起来，最后也不知道怎么搞的就又好了。

安装好了之后切到 Linux 的 postgres 用户下，创建一个新用户，设置密码

``` zsh
sudo su postgres
createuser --interactive
    chen
    y

psql
\password chen
```

## 启动 停止 重启

``` zsh
/etc/init.d/postgresql start
/etc/init.d/postgresql stop
/etc/init.d/postgresql restart
```

### 远程连接
``` zsh
sudo vi /etc/postgres/9.5/main/postgresql.conf
     listen_addresses = 'localhost' # 改成
     listen_addresses = '*'

sudo vi /etc/postgres/9.5/main/pg_hba.conf
     host all all 127.0.0.1/32 md5 # 下面加一行
     host all all 0.0.0.0/0 md5
```

然后重启一下就能远程连接了。


## 创建数据库、表 连接 导出 导入
### 创建数据库
前面已经建了 `chen` 这个用户，直接在这个用户的 shell 下面新建或者删除数据库：

``` zsh
createdb spending-vis
dropdb spending-vis
```

或者在 pgcli 里面操作，直接在 shell 里面输入 `pgcli` 会默认用当前 Linux 的用户名，作为用户名和数据库名称去连接，所以在前面新建用户的时候就要在 `postgres` 用户下把 `chen` 这个数据库也创建好。

``` zsh
create database "spending-vis"
drop database "spending-vis"
```

命令都有自动补全，很方便。

### 创建表
创建一个 entry 表，id 字增主键：

``` sql
CREATE TABLE entry(id serial PRIMARY Key, categoryid INTEGER, date DATE, year INTEGER, month INTEGER, day INTEGER, amount INTEGER, note VARCHAR)
```

### 连接

``` zsh
psql
psql -U Chen -d Chen
psql -U Chen -d spending-vis

pgcli
pgcli -U Chen -d Chen
pgcli -U Chen -d spending-vis

pgcli -h 127.0.0.1 -U chen -W -d spending-vis
    password:
\l
\du
\dt
\d entry
```

### 导出 导入

导出：

``` zsh
pg_dump -f spending-vis-postgresql.sql spending-vis
```

导入：

``` zsh
psql -d spending-vis -f export-postgresql/spending-vis-postgresql.sql
```

本地机器导出之后要导入到 VPS 上，本地用户名为 `Chen`，VPS 上是 `chen`，要在 `.sql` 里面改一下，VPS 要先建好数据库，然后导入。
还有个坑就是导入的语句，数据库里面有个字段是能够为空的，导入的时候就报错了，没办法，我只能把那个字段写成了 `无备注`，然后就能导入了。


## postgrest

[postgrest](https://github.com/begriffs/postgrest) 这个工具挺好，把现有的 PostgreSQL 数据库直接变成一个 RESTful API。

``` zsh
./postgrest postgres://user:password@localhost:5432/spending-vis \
          --port 3000 \
          --schema public \
          --anonymous postgres \
          --pool 200
```

直接就能 GET 获得 JSON

``` zsh
http://localhost:3000/entry
http://localhost:3000/entry?date=eq.2014-06-01
http://localhost:3000/entry?year=eq.2014&month=eq.6
```


