import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  type NestInterceptor,
  NotImplementedException,
} from '@nestjs/common';
import type { Observable } from 'rxjs';

// TODO bonus : mesurer le temps de traitement de chaque requête.
//   - noter l'heure avant d'appeler next.handle() ;
//   - avec l'opérateur `tap` de rxjs, une fois la réponse prête : calculer la durée,
//     l'écrire dans l'en-tête de réponse « X-Response-Time » (ex. « 12ms »)
//     et l'afficher avec un Logger de Nest ;
//   - l'enregistrer globalement dans main.ts : app.useGlobalInterceptors(new TimingInterceptor()).
@Injectable()
export class TimingInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, _next: CallHandler): Observable<unknown> {
    throw new NotImplementedException('TODO bonus : TimingInterceptor');
  }
}
