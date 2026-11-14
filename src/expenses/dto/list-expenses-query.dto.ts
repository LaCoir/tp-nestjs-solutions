import { ApiPropertyOptional } from '@nestjs/swagger';

// BONUS (pagination) — à compléter si vous avez terminé les étapes 1 à 4.
//
// TODO bonus : ajoutez les décorateurs class-validator / class-transformer :
//   limit  : entier entre 1 et 100, 20 par défaut   (@Type(() => Number) car les query params sont des textes)
//   offset : entier ≥ 0, 0 par défaut
// Puis utilisez ce DTO dans le contrôleur (@Query()) et dans ExpensesService.findAll.
export class ListExpensesQueryDto {
  @ApiPropertyOptional({ type: 'integer', minimum: 1, maximum: 100, default: 20 })
  limit: number = 20;

  @ApiPropertyOptional({ type: 'integer', minimum: 0, default: 0 })
  offset: number = 0;
}
