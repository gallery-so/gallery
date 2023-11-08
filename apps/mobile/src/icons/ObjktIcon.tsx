import { useColorScheme } from 'nativewind';
import * as React from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';

import colors from '~/shared/theme/colors';

export function ObjktIcon(props: SvgProps) {
  const { colorScheme } = useColorScheme();
  const fillColor = colorScheme === 'dark' ? colors.white : colors.black['800'];
  return (
    <Svg width={24} height={24} viewBox="0 0 16 16" fill="none" {...props}>
      <Path
        fill={fillColor}
        d="M2.70786 9.04343C2.48252 9.04343 2.27681 8.99104 2.09087 8.88609C1.90485 8.78121 1.75639 8.6325 1.64557 8.43986C1.53466 8.24729 1.47925 8.02372 1.47925 7.76921C1.47925 7.53198 1.53466 7.31703 1.64557 7.12439C1.75639 6.93184 1.90485 6.77876 2.09087 6.66526C2.27681 6.55175 2.48252 6.495 2.70786 6.495C2.9332 6.495 3.13975 6.55175 3.32753 6.66526C3.51532 6.77876 3.66554 6.93184 3.77821 7.12439C3.89087 7.31703 3.94721 7.53198 3.94721 7.76921C3.94721 8.02028 3.89087 8.24211 3.77821 8.43474C3.66554 8.62739 3.51532 8.77694 3.32753 8.88357C3.13975 8.99021 2.9332 9.04343 2.70786 9.04343ZM2.70786 8.4479C2.80443 8.4479 2.88935 8.41965 2.96271 8.36307C3.03597 8.30656 3.09415 8.22752 3.13707 8.12609C3.17999 8.02465 3.20145 7.90568 3.20145 7.76921C3.20145 7.62285 3.17999 7.49979 3.13707 7.39994C3.09415 7.30018 3.03597 7.22365 2.96271 7.17042C2.88935 7.11718 2.80443 7.09053 2.70786 7.09053C2.61842 7.09053 2.53701 7.11718 2.46374 7.17042C2.3904 7.22365 2.3323 7.30018 2.28938 7.39994C2.24646 7.49979 2.225 7.62285 2.225 7.76921C2.225 7.90568 2.24554 8.02465 2.2867 8.12609C2.32777 8.22752 2.38503 8.30656 2.45838 8.36307C2.53165 8.41965 2.61481 8.4479 2.70786 8.4479Z"
      />
      <Path
        fill={fillColor}
        d="M5.36085 9.01128C5.28389 8.98982 5.21062 8.95587 5.14088 8.90935C5.07113 8.8629 5.00759 8.80565 4.95042 8.73767L4.86994 9.00055H4.26904V5.43274H5.07381V5.49293C5.05588 5.51489 5.04431 5.53862 5.03894 5.5641C5.03358 5.58967 5.03089 5.63351 5.03089 5.69555V6.77402C5.06661 6.7311 5.106 6.69271 5.14893 6.65867C5.19185 6.62472 5.23921 6.59521 5.29111 6.57014C5.34291 6.54516 5.39748 6.52639 5.45474 6.51381C5.51191 6.50132 5.57093 6.49503 5.63179 6.49503C5.78553 6.49855 5.92419 6.52605 6.04759 6.57761C6.17098 6.62925 6.27644 6.7057 6.36413 6.80713C6.45173 6.90857 6.51972 7.03499 6.568 7.1863C6.61629 7.33769 6.64043 7.51483 6.64043 7.7177C6.64043 7.94471 6.61361 8.14154 6.55996 8.30836C6.50631 8.47519 6.43203 8.61275 6.3373 8.72106C6.24249 8.82937 6.13159 8.91018 6.00466 8.9635C5.87766 9.01681 5.74085 9.04347 5.59423 9.04347C5.51552 9.04347 5.43772 9.03274 5.36085 9.01128ZM5.6157 8.44794C5.67287 8.42289 5.72207 8.38281 5.76323 8.32765C5.80431 8.27249 5.8365 8.20065 5.85981 8.11212C5.88303 8.0236 5.89468 7.91747 5.89468 7.79383C5.89468 7.68023 5.88479 7.57745 5.86517 7.48557C5.84547 7.3937 5.81688 7.31431 5.77933 7.24741C5.74177 7.1806 5.69433 7.12879 5.63715 7.09208C5.5799 7.05535 5.51375 7.03691 5.43864 7.03691C5.34919 7.03691 5.275 7.06366 5.21599 7.11714C5.15698 7.17062 5.11313 7.24909 5.08454 7.3527C5.05588 7.45631 5.03978 7.58491 5.03626 7.73866C5.03626 7.86567 5.04431 7.97589 5.0604 8.06944C5.07649 8.163 5.10148 8.24071 5.13551 8.30258C5.16946 8.36445 5.21062 8.41039 5.25891 8.4404C5.3072 8.4705 5.36353 8.4855 5.42791 8.4855C5.49582 8.4855 5.55844 8.47301 5.6157 8.44794Z"
      />
      <Path
        fill={fillColor}
        d="M7.27092 9.8187C7.12959 9.74896 6.99814 9.64786 6.87659 9.51558L7.28434 8.97906L7.31653 8.94151L7.36481 8.97369C7.37194 9.00229 7.37823 9.0318 7.38359 9.06222C7.38896 9.09256 7.4095 9.13105 7.44529 9.17758C7.48461 9.21689 7.52845 9.24816 7.57674 9.27146C7.62502 9.29468 7.68312 9.30634 7.75111 9.30634C7.83334 9.30634 7.8968 9.29091 7.94157 9.26023C7.98625 9.22946 8.01668 9.18252 8.03277 9.11931C8.04887 9.0561 8.05692 8.98015 8.05692 8.89129V7.13882H7.21459V6.54866H8.82413V8.82968C8.82413 9.09006 8.77224 9.30097 8.66854 9.46242C8.56476 9.62388 8.43156 9.741 8.26884 9.81401C8.10605 9.88686 7.93352 9.92333 7.75111 9.92333C7.57221 9.92333 7.41218 9.88845 7.27092 9.8187ZM8.38955 6.03361C8.26432 6.03361 8.15794 5.99161 8.07033 5.90752C7.98265 5.82353 7.93889 5.72427 7.93889 5.60976C7.93889 5.4846 7.98088 5.38267 8.06497 5.30395C8.14896 5.22531 8.25719 5.18591 8.38955 5.18591C8.50759 5.18591 8.61222 5.228 8.70341 5.312C8.79463 5.39607 8.84022 5.49533 8.84022 5.60976C8.84022 5.72427 8.79463 5.82353 8.70341 5.90752C8.61222 5.9916 8.50759 6.03361 8.38955 6.03361Z"
      />
      <Path
        fill={fillColor}
        d="M10.5356 7.95796L10.4122 8.0837V9.00055H9.65039V5.43274H10.4552V5.49134C10.4372 5.51271 10.4257 5.53585 10.4203 5.56066C10.4149 5.58556 10.4122 5.62823 10.4122 5.68859V7.27164L11.1902 6.50577C11.2224 6.51298 11.2581 6.51918 11.2975 6.52454C11.3368 6.52991 11.3761 6.53444 11.4155 6.53796C11.4548 6.54156 11.4915 6.54424 11.5255 6.54601C11.5595 6.54785 11.5854 6.54869 11.6033 6.54869H11.995L11.0292 7.50217L12.1023 8.99518L11.2868 9.02201L10.5356 7.95796Z"
      />
      <Path
        fill={fillColor}
        d="M12.3759 6.54869H14.4039L14.3931 7.13886H12.3651L12.3759 6.54869ZM13.3416 8.98362C13.2307 8.94372 13.1359 8.87607 13.0572 8.78059C12.9785 8.6852 12.9195 8.55416 12.8802 8.38751C12.8408 8.22093 12.8265 8.00918 12.8372 7.75234L12.9124 5.98217L13.6849 5.88325L13.7332 5.87805L13.7386 5.93497C13.7243 5.95912 13.7099 5.98317 13.6957 6.00732C13.6813 6.03146 13.6724 6.07287 13.6688 6.13139L13.6045 6.92769H13.6367L13.5937 7.70337C13.583 7.89987 13.5911 8.05244 13.6179 8.161C13.6447 8.26965 13.684 8.34459 13.7359 8.38592C13.7877 8.42733 13.8423 8.44795 13.8995 8.44795C14.0104 8.44795 14.1115 8.42474 14.2027 8.3782C14.2939 8.33177 14.3734 8.27987 14.4414 8.22262L14.5702 8.75376C14.4485 8.84322 14.3171 8.91388 14.1758 8.96568C14.0345 9.0175 13.8781 9.04348 13.7064 9.04348C13.574 9.04348 13.4524 9.02353 13.3416 8.98362Z"
      />
      <Path
        fill={fillColor}
        d="M8.77382 10.814C8.71656 10.814 8.66829 10.7943 8.62896 10.755C8.5896 10.7157 8.56995 10.6683 8.56995 10.6128C8.56995 10.5574 8.5896 10.51 8.62896 10.4706C8.66829 10.4313 8.71656 10.4116 8.77382 10.4116C8.82924 10.4116 8.87664 10.4313 8.91599 10.4706C8.95531 10.51 8.97501 10.5574 8.97501 10.6128C8.97501 10.6683 8.95531 10.7157 8.91599 10.755C8.87664 10.7943 8.82924 10.814 8.77382 10.814Z"
      />
      <Path
        fill={fillColor}
        d="M9.96623 10.767C9.88845 10.7357 9.82045 10.6922 9.76236 10.6365C9.70423 10.5808 9.65909 10.5146 9.62689 10.438C9.5947 10.3615 9.57861 10.277 9.57861 10.1847C9.57861 10.096 9.5947 10.0124 9.62689 9.93409C9.65909 9.85576 9.70423 9.78743 9.76236 9.72912C9.82045 9.67083 9.88845 9.62468 9.96623 9.59073C10.044 9.55678 10.1294 9.53979 10.2224 9.53979C10.3368 9.53979 10.437 9.56125 10.5229 9.60418C10.6087 9.6471 10.6767 9.70612 10.7267 9.78122L10.5577 9.96632L10.5416 9.9851L10.5202 9.969C10.5202 9.95471 10.5184 9.93996 10.5148 9.92475C10.5112 9.90958 10.4996 9.89121 10.4799 9.86975C10.446 9.8358 10.4084 9.813 10.3673 9.80134C10.3261 9.78973 10.2788 9.78391 10.2251 9.78391C10.1804 9.78391 10.1379 9.79293 10.0977 9.8109C10.0574 9.82888 10.0212 9.85458 9.98904 9.88794C9.95685 9.92131 9.93179 9.96284 9.91393 10.0125C9.89603 10.0621 9.88711 10.1195 9.88711 10.1845C9.88711 10.2428 9.89649 10.2954 9.91527 10.3425C9.93405 10.3896 9.95908 10.4299 9.99038 10.4632C10.0217 10.4966 10.0583 10.5223 10.1004 10.5403C10.1424 10.5582 10.1866 10.5672 10.2332 10.5672C10.2707 10.5672 10.3073 10.5619 10.3431 10.5511C10.3789 10.5404 10.4142 10.5239 10.4491 10.5015C10.484 10.4792 10.5166 10.4492 10.547 10.4116L10.716 10.6048C10.6498 10.6781 10.5729 10.7313 10.4853 10.7644C10.3977 10.7975 10.3092 10.814 10.2197 10.814C10.1285 10.814 10.044 10.7983 9.96623 10.767Z"
      />
      <Path
        fill={fillColor}
        d="M11.4832 10.814C11.3723 10.814 11.2717 10.7874 11.1814 10.734C11.0911 10.6807 11.02 10.606 10.9682 10.5099C10.9163 10.4138 10.8904 10.3028 10.8904 10.1769C10.8904 10.0563 10.9163 9.94797 10.9682 9.85182C11.02 9.75565 11.0911 9.67962 11.1814 9.62371C11.2717 9.56779 11.3723 9.53979 11.4832 9.53979C11.5959 9.53979 11.6974 9.56779 11.7877 9.62371C11.878 9.67962 11.9495 9.75565 12.0023 9.85182C12.055 9.94797 12.0814 10.0563 12.0814 10.1769C12.0814 10.3028 12.055 10.4138 12.0023 10.5099C11.9495 10.606 11.878 10.6807 11.7877 10.734C11.6974 10.7874 11.5959 10.814 11.4832 10.814ZM11.4832 10.5726C11.5422 10.5726 11.5932 10.5558 11.6361 10.5222C11.6791 10.4885 11.7135 10.442 11.7394 10.3825C11.7653 10.3231 11.7783 10.2545 11.7783 10.177C11.7783 10.096 11.7653 10.0261 11.7394 9.96754C11.7135 9.90895 11.6791 9.86367 11.6361 9.83178C11.5932 9.79988 11.5422 9.78391 11.4832 9.78391C11.4296 9.78391 11.3808 9.79988 11.337 9.83178C11.2932 9.86367 11.2583 9.90895 11.2324 9.96754C11.2065 10.0261 11.1935 10.096 11.1935 10.177C11.1935 10.2545 11.206 10.3231 11.2311 10.3825C11.2561 10.442 11.2905 10.4885 11.3343 10.5222C11.3781 10.5558 11.4278 10.5726 11.4832 10.5726Z"
      />
      <Path
        fill={fillColor}
        d="M12.2371 10.7926V9.56662H12.4919V9.66051C12.5134 9.63193 12.5357 9.60866 12.559 9.59076C12.5822 9.57291 12.6068 9.55991 12.6327 9.55186C12.6586 9.54383 12.6841 9.53979 12.7092 9.53979C12.7396 9.53979 12.7682 9.54474 12.795 9.55455C12.8219 9.5644 12.8464 9.58049 12.8688 9.60283C12.8912 9.62522 12.9086 9.65427 12.9211 9.69002C12.9408 9.65607 12.9631 9.6279 12.9882 9.60552C13.0132 9.58318 13.0423 9.56662 13.0754 9.55589C13.1084 9.54517 13.1446 9.53979 13.184 9.53979C13.2305 9.53979 13.2699 9.54772 13.302 9.56347C13.3342 9.57928 13.3606 9.60209 13.3812 9.63193C13.4017 9.66177 13.4165 9.69862 13.4254 9.74245C13.4344 9.78634 13.4389 9.83546 13.4389 9.88983V10.7926H13.176V9.9563C13.176 9.90392 13.1733 9.86326 13.1679 9.83441C13.1625 9.80558 13.1545 9.7855 13.1438 9.77415C13.133 9.76279 13.1187 9.75708 13.1008 9.75708C13.0776 9.75708 13.0552 9.76802 13.0338 9.78986C13.0123 9.81174 12.9949 9.84145 12.9815 9.87901C12.9681 9.91657 12.9614 9.9607 12.9614 10.0114V10.7926H12.7146V9.96415C12.7146 9.88023 12.7083 9.82431 12.6958 9.79636C12.6833 9.7684 12.66 9.7544 12.626 9.7544C12.6099 9.7544 12.5943 9.75968 12.5791 9.77016C12.5639 9.78064 12.5505 9.79594 12.5388 9.81602C12.5272 9.83614 12.5178 9.86145 12.5107 9.89205C12.5035 9.92265 12.5 9.95714 12.5 9.99558V10.7926H12.2371Z"
      />
    </Svg>
  );
}