import React from 'react';
import DashboardIcon from '@mui/icons-material/Dashboard';
import GroupIcon from '@mui/icons-material/Group';
import GroupsIcon from '@mui/icons-material/Groups';
import SchoolIcon from '@mui/icons-material/School';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PaymentsIcon from '@mui/icons-material/Payments';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import NotificationsIcon from '@mui/icons-material/Notifications';
import HistoryIcon from '@mui/icons-material/History';
import SettingsIcon from '@mui/icons-material/Settings';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import DownloadIcon from '@mui/icons-material/Download';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import EditIcon from '@mui/icons-material/Edit';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import DateRangeIcon from '@mui/icons-material/DateRange';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import CloseIcon from '@mui/icons-material/Close';
import InfoIcon from '@mui/icons-material/Info';
import CheckIcon from '@mui/icons-material/Check';
import DeleteIcon from '@mui/icons-material/Delete';

// Icon mapping object
const iconMap = {
  Dashboard: DashboardIcon,
  Group: GroupIcon,
  Groups: GroupsIcon,
  School: SchoolIcon,
  AccountBalanceWallet: AccountBalanceWalletIcon,
  Payments: PaymentsIcon,
  ReceiptLong: ReceiptLongIcon,
  Notifications: NotificationsIcon,
  History: HistoryIcon,
  Settings: SettingsIcon,
  CalendarToday: CalendarTodayIcon,
  ArrowDropDown: ArrowDropDownIcon,
  Download: DownloadIcon,
  TrendingUp: TrendingUpIcon,
  TrendingDown: TrendingDownIcon,
  MoreHoriz: MoreHorizIcon,
  Visibility: VisibilityIcon,
  ChevronRight: ChevronRightIcon,
  Add: AddIcon,
  Search: SearchIcon,
  FilterList: FilterListIcon,
  Edit: EditIcon,
  VpnKey: VpnKeyIcon,
  DateRange: DateRangeIcon,
  FileDownload: FileDownloadIcon,
  Close: CloseIcon,
  Info: InfoIcon,
  Check: CheckIcon,
  Delete: DeleteIcon,
};

// Function to get icon component from icon name
export const getIcon = (iconName) => {
  const IconComponent = iconMap[iconName];
  return IconComponent ? IconComponent : DashboardIcon; // Default to Dashboard icon
};

// Function to render icon with props
export const renderIcon = (iconName, props = {}) => {
  const IconComponent = getIcon(iconName);
  return <IconComponent {...props} />;
};

export default iconMap; 