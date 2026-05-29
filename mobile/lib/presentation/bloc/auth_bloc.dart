import 'package:flutter_bloc/flutter_bloc.dart';
import '../../data/datasources/auth_data_source.dart';
import '../../data/models/user_model.dart';

// --- Events ---
abstract class AuthEvent {}

class AuthCheckRequested extends AuthEvent {}

class AuthLoginRequested extends AuthEvent {
  final String email;
  final String password;
  AuthLoginRequested(this.email, this.password);
}

class AuthRegisterRequested extends AuthEvent {
  final String fullName;
  final String email;
  final String password;
  AuthRegisterRequested({
    required this.fullName,
    required this.email,
    required this.password,
  });
}

class AuthLogoutRequested extends AuthEvent {}

// --- States ---
abstract class AuthState {}

class AuthInitial extends AuthState {}

class AuthLoading extends AuthState {}

class AuthAuthenticated extends AuthState {
  final UserModel user;
  AuthAuthenticated(this.user);
}

class AuthUnauthenticated extends AuthState {}

class AuthFailure extends AuthState {
  final String error;
  AuthFailure(this.error);
}

// --- Bloc ---
class AuthBloc extends Bloc<AuthEvent, AuthState> {
  final AuthDataSource _authDataSource;

  AuthBloc(this._authDataSource) : super(AuthInitial()) {
    on<AuthCheckRequested>((event, emit) async {
      emit(AuthLoading());
      try {
        final authenticated = await _authDataSource.isAuthenticated();
        if (authenticated) {
          // Can read user details cache here if needed
          emit(AuthAuthenticated(UserModel(id: 1, fullName: 'Học viên VSL', email: '', role: 'learner')));
        } else {
          emit(AuthUnauthenticated());
        }
      } catch (_) {
        emit(AuthUnauthenticated());
      }
    });

    on<AuthLoginRequested>((event, emit) async {
      emit(AuthLoading());
      try {
        final user = await _authDataSource.login(event.email, event.password);
        emit(AuthAuthenticated(user));
      } catch (e) {
        emit(AuthFailure(e.toString().replaceAll('Exception: ', '')));
      }
    });

    on<AuthRegisterRequested>((event, emit) async {
      emit(AuthLoading());
      try {
        final user = await _authDataSource.register(
          event.fullName,
          event.email,
          event.password,
        );
        emit(AuthAuthenticated(user));
      } catch (e) {
        emit(AuthFailure(e.toString().replaceAll('Exception: ', '')));
      }
    });

    on<AuthLogoutRequested>((event, emit) async {
      emit(AuthLoading());
      await _authDataSource.logout();
      emit(AuthUnauthenticated());
    });
  }
}
