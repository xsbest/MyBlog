import React, { useState } from 'react'
import marked from 'marked'
import styles from './index.module.scss'
import { Input, Select, DatePicker, Button } from 'antd'
const { Option } = Select
const { TextArea } = Input
const { RangePicker } = DatePicker
function AddArticle() {
  return (
    <div className={styles.container}>
      <div className={styles.options}>
        <Input style={{ width: 900 }} placeholder="请输入博客标题" />
        <Select defaultValue={1} style={{ width: 120, marginRight: 35 }} placeholder="4123" options={[{ value: 1, label: '视频教程' }]} />
        <Button>暂存文章</Button>
        <Button type="primary">发布文章</Button>
      </div>
      <div className={styles.editContent}>
        <div className={styles.editArea}>123</div>
        <div className={styles.translateArticle}>12</div>
        <div className={styles.editDetail}>
          <textarea style={{ border: '1px solid #ccc' }} cols="90" rows="10"></textarea>
          <RangePicker placeholder={['发布日期', '修改日期']}></RangePicker>
        </div>
      </div>
    </div>
  )
}
export default AddArticle