import type { IconWeight } from '@phosphor-icons/react/dist/lib/types';
import { ArrowBendDownLeftIcon } from '@phosphor-icons/react/dist/ssr/ArrowBendDownLeft';
import { ArrowsInSimpleIcon } from '@phosphor-icons/react/dist/ssr/ArrowsInSimple';
import { ArrowsOutSimpleIcon } from '@phosphor-icons/react/dist/ssr/ArrowsOutSimple';
import { ArrowSquareOutIcon } from '@phosphor-icons/react/dist/ssr/ArrowSquareOut';
import { ArrowUpRightIcon } from '@phosphor-icons/react/dist/ssr/ArrowUpRight';
import { ArticleIcon } from '@phosphor-icons/react/dist/ssr/Article';
import { ChartBarIcon } from '@phosphor-icons/react/dist/ssr/ChartBar';
import { ChatsIcon } from '@phosphor-icons/react/dist/ssr/Chats';
import { CheckCircleIcon } from '@phosphor-icons/react/dist/ssr/CheckCircle';
import { CommandIcon } from '@phosphor-icons/react/dist/ssr/Command';
import { CopySimpleIcon } from '@phosphor-icons/react/dist/ssr/CopySimple';
import { CornersOutIcon } from '@phosphor-icons/react/dist/ssr/CornersOut';
import { DatabaseIcon } from '@phosphor-icons/react/dist/ssr/Database';
import { DotsThreeVerticalIcon } from '@phosphor-icons/react/dist/ssr/DotsThreeVertical';
import { DownloadSimpleIcon } from '@phosphor-icons/react/dist/ssr/DownloadSimple';
import { EnvelopeIcon } from '@phosphor-icons/react/dist/ssr/Envelope';
import { ExclamationMarkIcon } from '@phosphor-icons/react/dist/ssr/ExclamationMark';
import { EyeIcon } from '@phosphor-icons/react/dist/ssr/Eye';
import { EyeSlashIcon } from '@phosphor-icons/react/dist/ssr/EyeSlash';
import { FileTextIcon } from '@phosphor-icons/react/dist/ssr/FileText';
import { FloppyDiskIcon } from '@phosphor-icons/react/dist/ssr/FloppyDisk';
import { FunnelIcon } from '@phosphor-icons/react/dist/ssr/Funnel';
import { GearIcon } from '@phosphor-icons/react/dist/ssr/Gear';
import { HeartIcon } from '@phosphor-icons/react/dist/ssr/Heart';
import { InfoIcon } from '@phosphor-icons/react/dist/ssr/Info';
import { LightningIcon } from '@phosphor-icons/react/dist/ssr/Lightning';
import { LinkIcon } from '@phosphor-icons/react/dist/ssr/Link';
import { LockIcon } from '@phosphor-icons/react/dist/ssr/Lock';
import { MagnifyingGlassIcon } from '@phosphor-icons/react/dist/ssr/MagnifyingGlass';
import { MinusCircleIcon } from '@phosphor-icons/react/dist/ssr/MinusCircle';
import { PaperclipIcon } from '@phosphor-icons/react/dist/ssr/Paperclip';
import { PencilSimpleIcon } from '@phosphor-icons/react/dist/ssr/PencilSimple';
import { PencilSimpleLineIcon } from '@phosphor-icons/react/dist/ssr/PencilSimpleLine';
import { QuestionIcon } from '@phosphor-icons/react/dist/ssr/Question';
import { RocketLaunchIcon } from '@phosphor-icons/react/dist/ssr/RocketLaunch';
import { SparkleIcon } from '@phosphor-icons/react/dist/ssr/Sparkle';
import { SpinnerGapIcon } from '@phosphor-icons/react/dist/ssr/SpinnerGap';
import { StarIcon } from '@phosphor-icons/react/dist/ssr/Star';
import { TrashIcon } from '@phosphor-icons/react/dist/ssr/Trash';
import { UserIcon } from '@phosphor-icons/react/dist/ssr/User';
import { UsersIcon } from '@phosphor-icons/react/dist/ssr/Users';
import { WarningIcon } from '@phosphor-icons/react/dist/ssr/Warning';
import { WarningCircleIcon } from '@phosphor-icons/react/dist/ssr/WarningCircle';
import { XCircleIcon } from '@phosphor-icons/react/dist/ssr/XCircle';

import {
  ArrowDownIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  CaretDoubleRightIcon,
  CaretDownIcon,
  CaretRightIcon,
  CaretUpIcon,
  CheckIcon,
  DotsSixVerticalIcon,
  MinusIcon,
  PlusIcon,
  XCloseIcon,
  XIcon,
} from '../icons/PaddedPhosphorIcons';
import type { IconComponent } from '../utils/icon-types';

export type PhosphorCatalogEntry = readonly [
  legacyName: string,
  phosphorName: string,
  icon: IconComponent,
  weight: IconWeight,
];

export const phosphorCatalogEntries = [
  ['AlertCircleIcon', 'WarningCircleIcon', WarningCircleIcon, 'regular'],
  ['AlertCircleSolidIcon', 'WarningCircleIcon', WarningCircleIcon, 'fill'],
  ['AlertSolidIcon', 'ExclamationMarkIcon', ExclamationMarkIcon, 'bold'],
  ['AlertTriangleIcon', 'WarningIcon', WarningIcon, 'regular'],
  ['AlertTriangleSolidIcon', 'WarningIcon', WarningIcon, 'fill'],
  ['ArrowDownIcon', 'ArrowDownIcon', ArrowDownIcon, 'regular'],
  ['ArrowNarrowUpRightIcon', 'ArrowUpRightIcon', ArrowUpRightIcon, 'bold'],
  ['ArrowRightIcon', 'ArrowRightIcon', ArrowRightIcon, 'regular'],
  ['ArrowUpIcon', 'ArrowUpIcon', ArrowUpIcon, 'regular'],
  ['BarChart10Icon', 'ChartBarIcon', ChartBarIcon, 'regular'],
  ['CheckCircleIcon', 'CheckCircleIcon', CheckCircleIcon, 'regular'],
  ['CheckCircleSolidIcon', 'CheckCircleIcon', CheckCircleIcon, 'fill'],
  ['CheckIcon', 'CheckIcon', CheckIcon, 'regular'],
  ['ChevronDownIcon', 'CaretDownIcon', CaretDownIcon, 'regular'],
  [
    'ChevronRightDoubleIcon',
    'CaretDoubleRightIcon',
    CaretDoubleRightIcon,
    'regular',
  ],
  ['ChevronRightIcon', 'CaretRightIcon', CaretRightIcon, 'regular'],
  ['ChevronUpIcon', 'CaretUpIcon', CaretUpIcon, 'regular'],
  ['CommandIcon', 'CommandIcon', CommandIcon, 'bold'],
  ['Copy06Icon', 'CopySimpleIcon', CopySimpleIcon, 'regular'],
  [
    'CornerDownLeftIcon',
    'ArrowBendDownLeftIcon',
    ArrowBendDownLeftIcon,
    'bold',
  ],
  ['Database02Icon', 'DatabaseIcon', DatabaseIcon, 'regular'],
  ['DotsVerticalIcon', 'DotsThreeVerticalIcon', DotsThreeVerticalIcon, 'bold'],
  ['Download01Icon', 'DownloadSimpleIcon', DownloadSimpleIcon, 'regular'],
  ['DragIcon', 'DotsSixVerticalIcon', DotsSixVerticalIcon, 'bold'],
  ['Edit01Icon', 'PencilSimpleIcon', PencilSimpleIcon, 'regular'],
  ['Edit02Icon', 'PencilSimpleIcon', PencilSimpleIcon, 'regular'],
  ['Edit03Icon', 'PencilSimpleLineIcon', PencilSimpleLineIcon, 'regular'],
  ['Expand01Icon', 'ArrowsOutSimpleIcon', ArrowsOutSimpleIcon, 'regular'],
  ['EyeIcon', 'EyeIcon', EyeIcon, 'regular'],
  ['EyeOffIcon', 'EyeSlashIcon', EyeSlashIcon, 'regular'],
  ['File02Icon', 'ArticleIcon', ArticleIcon, 'regular'],
  ['File06Icon', 'FileTextIcon', FileTextIcon, 'bold'],
  ['FilterFunnel01Icon', 'FunnelIcon', FunnelIcon, 'regular'],
  ['FilterFunnel01SolidIcon', 'FunnelIcon', FunnelIcon, 'fill'],
  ['HeartIcon', 'HeartIcon', HeartIcon, 'regular'],
  ['HelpCircleIcon', 'QuestionIcon', QuestionIcon, 'regular'],
  ['InfoCircleIcon', 'InfoIcon', InfoIcon, 'regular'],
  ['InfoCircleSolidIcon', 'InfoIcon', InfoIcon, 'fill'],
  ['Lightning01Icon', 'LightningIcon', LightningIcon, 'bold'],
  ['Link01Icon', 'LinkIcon', LinkIcon, 'bold'],
  ['LinkExternal01Icon', 'ArrowSquareOutIcon', ArrowSquareOutIcon, 'regular'],
  ['Loading01Icon', 'SpinnerGapIcon', SpinnerGapIcon, 'bold'],
  ['Lock01Icon', 'LockIcon', LockIcon, 'regular'],
  ['Mail01Icon', 'EnvelopeIcon', EnvelopeIcon, 'regular'],
  ['Maximize02Icon', 'CornersOutIcon', CornersOutIcon, 'regular'],
  ['MessageChatSquareIcon', 'ChatsIcon', ChatsIcon, 'regular'],
  ['Minimize01Icon', 'ArrowsInSimpleIcon', ArrowsInSimpleIcon, 'regular'],
  ['MinusCircleIcon', 'MinusCircleIcon', MinusCircleIcon, 'regular'],
  ['MinusCircleSolidIcon', 'MinusCircleIcon', MinusCircleIcon, 'fill'],
  ['MinusIcon', 'MinusIcon', MinusIcon, 'bold'],
  ['PaperclipIcon', 'PaperclipIcon', PaperclipIcon, 'bold'],
  ['PlusIcon', 'PlusIcon', PlusIcon, 'regular'],
  ['Rocket01Icon', 'RocketLaunchIcon', RocketLaunchIcon, 'bold'],
  ['Save01Icon', 'FloppyDiskIcon', FloppyDiskIcon, 'regular'],
  ['SearchLgIcon', 'MagnifyingGlassIcon', MagnifyingGlassIcon, 'regular'],
  ['SearchMdIcon', 'MagnifyingGlassIcon', MagnifyingGlassIcon, 'regular'],
  ['SearchSmIcon', 'MagnifyingGlassIcon', MagnifyingGlassIcon, 'regular'],
  ['Settings01Icon', 'GearIcon', GearIcon, 'regular'],
  ['Settings01SolidIcon', 'GearIcon', GearIcon, 'fill'],
  ['Star01Icon', 'StarIcon', StarIcon, 'regular'],
  ['Stars02Icon', 'SparkleIcon', SparkleIcon, 'regular'],
  ['Stars02SolidIcon', 'SparkleIcon', SparkleIcon, 'fill'],
  ['Trash01Icon', 'TrashIcon', TrashIcon, 'regular'],
  ['User02Icon', 'UserIcon', UserIcon, 'regular'],
  ['Users01Icon', 'UsersIcon', UsersIcon, 'regular'],
  ['XCircleIcon', 'XCircleIcon', XCircleIcon, 'regular'],
  ['XCircleSolidIcon', 'XCircleIcon', XCircleIcon, 'fill'],
  ['XCloseIcon', 'XIcon', XCloseIcon, 'bold'],
  ['XIcon', 'XIcon', XIcon, 'bold'],
] satisfies PhosphorCatalogEntry[];
