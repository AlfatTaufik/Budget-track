import React from 'react';
import { motion } from 'framer-motion';
import HeroCard from '../components/Dashboard/HeroCard';
import MonthlyChart from '../components/Dashboard/MonthlyChart';
import RecentTransactions from '../components/Dashboard/RecentTransactions';

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

const DashboardPage = ({ onNavigate }) => {
  return (
    <motion.div className="page page-wide" variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <div className="dashboard-grid">
        <HeroCard onNavigate={onNavigate} />
        <MonthlyChart onNavigate={onNavigate} />
        <RecentTransactions onViewAll={() => onNavigate('transactions')} />
      </div>
    </motion.div>
  );
};

export default DashboardPage;
