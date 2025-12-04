import LMStudioIcon from '@/assets/providers/lmstudio.png'
import DeepseekIcon from '@/assets/providers/deepseek.png'
import AliyunbailianIcon from '@/assets/providers/aliyunbailian.png'
import { Provider } from '&/provider'

export const providers: Provider[] = [
  {
    id: 'lmstudio',
    name: 'LM Studio',
    icon: LMStudioIcon,
    websites: {
      official: 'https://lmstudio.ai/',
    },
    type: 'openai',
    url: 'http://localhost:1234',
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    icon: DeepseekIcon,
    websites: {
      official: 'https://deepseek.com/',
      apiKey: 'https://platform.deepseek.com/api_keys',
    },
    type: 'openai',
    url: 'https://api.deepseek.com',
  },
  {
    id: 'aliyunbailian',
    name: '阿里云百炼',
    icon: AliyunbailianIcon,
    websites: {
      official: 'https://bailian.console.aliyun.com/',
      apiKey: 'https://bailian.console.aliyun.com/?tab=model#/api-key',
    },
    type: 'openai',
    url: 'https://dashscope.aliyuncs.com/compatible-mode',
  },
]
