import React, { useState } from 'react';
import Header from './components/header';
import Form, { IFormData } from './components/form';
import DataVerify from './components/data-verify';

const Page: React.FC = () => {

  const [verifyData, setVerifyData] = useState<IFormData>();

  const handleSubmit = async (verifyData: IFormData) => {
    console.log(verifyData)
    setVerifyData(verifyData);
  };

  return <div className='min-h-screen bg-[#1C1C26] text-white'>
    <Header></Header>
    <Form onSubmit={handleSubmit}></Form>
    <DataVerify verifyData={verifyData}></DataVerify>
  </div>;
};

export default Page;