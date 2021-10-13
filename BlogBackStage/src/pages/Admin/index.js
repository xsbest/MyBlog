import { Layout, Menu, Breadcrumb, Image } from 'antd';
import { PieChartOutlined, DesktopOutlined, UserOutlined } from '@ant-design/icons';
import headPic from './head.jpg'
import styles from './index.module.scss'
import { Route } from "react-router-dom";
import AddArticle from '../AddArticle'
import AddArticleList from '../AddArticleList';
const { SubMenu } = Menu;
const { Header, Content, Sider } = Layout;

function Admin(props) {

  const handleClickArticle = e => {
    console.log(e.key);
    if (e.key === 'addArticle') {
      props.history.push('/index/add')
    } else {
      props.history.push('/index/list')
    }
  }
  return (
    <Layout style={{ height: '100%' }}>
      <Header className={styles["header"]}>
        <div className={styles["logo"]}>
          <Image src={headPic} width={60} height={60} alt=""></Image>
        </div>
      </Header>
      <Layout>
        <Sider width={200} className={styles["site-layout-background"]}>
          <Menu
            mode="inline"
            defaultSelectedKeys={['1']}
            style={{ height: '100%', borderRight: 0 }}

          >
            <Menu.Item key="sub1" icon={<PieChartOutlined />}>
              工作台
            </Menu.Item>
            <SubMenu key="sub3" icon={<UserOutlined />} onClick={handleClickArticle} title="文章管理">
              <Menu.Item key="addArticle">添加文章</Menu.Item>
              <Menu.Item key="articleList">添加列表</Menu.Item>
            </SubMenu>
            <Menu.Item key="sub5" icon={<DesktopOutlined />} >
              留言管理
            </Menu.Item>
          </Menu>
        </Sider>
        <Layout style={{ padding: '0 24px 24px' }}>
          <Breadcrumb style={{ margin: '16px 0' }}>
            <Breadcrumb.Item>后台管理系统</Breadcrumb.Item>
            <Breadcrumb.Item>工作台</Breadcrumb.Item>
          </Breadcrumb>
          <Content
            className={styles["site-layout-background"]}
            style={{
              padding: 24,
              margin: 0,
              minHeight: 280,
            }}
          >
            <div style={{ height: '100%' }}>
              <Route path="/" exact component={AddArticle} />
              <Route path="/index/add/" exact component={AddArticle} />
              <Route path="/index/list/" exact component={AddArticleList} />
            </div>

          </Content>
        </Layout>
      </Layout>
    </Layout>
  )
}

export default Admin
