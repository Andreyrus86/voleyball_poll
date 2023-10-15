import { Catch, ArgumentsHost } from '@nestjs/common';
import { TelegrafExceptionFilter } from 'nestjs-telegraf/dist/interfaces/telegraf-exception-filter.interface';

@Catch()
export class TelegrafExceptionsFilter
  implements TelegrafExceptionFilter<unknown>
{
  catch(exception: Error, host: ArgumentsHost): unknown {
    return exception.message;
  }
}
